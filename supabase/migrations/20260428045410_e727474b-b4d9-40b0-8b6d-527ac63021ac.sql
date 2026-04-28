-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Predictions
CREATE TABLE public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id INTEGER NOT NULL,
  predicted_winner TEXT NOT NULL,
  predicted_home_score INTEGER NOT NULL,
  predicted_away_score INTEGER NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, match_id)
);
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Predictions viewable by everyone" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Users can insert own predictions" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own predictions" ON public.predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own predictions" ON public.predictions FOR DELETE USING (auth.uid() = user_id);

-- Match background image cache
CREATE TABLE public.match_backgrounds (
  match_id INTEGER PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.match_backgrounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Backgrounds viewable by everyone" ON public.match_backgrounds FOR SELECT USING (true);

-- Storage bucket for AI backgrounds
INSERT INTO storage.buckets (id, name, public) VALUES ('match-backgrounds', 'match-backgrounds', true);
CREATE POLICY "Public read backgrounds" ON storage.objects FOR SELECT USING (bucket_id = 'match-backgrounds');

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER predictions_updated_at BEFORE UPDATE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to recompute total points
CREATE OR REPLACE FUNCTION public.recompute_user_points(_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles
  SET total_points = COALESCE((SELECT SUM(points_earned) FROM public.predictions WHERE user_id = _user_id), 0)
  WHERE id = _user_id;
END; $$;

CREATE OR REPLACE FUNCTION public.predictions_update_points()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recompute_user_points(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE TRIGGER predictions_points_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION public.predictions_update_points();