import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, dummySignIn } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate("/", { replace: true }); }, [user, navigate]);

  const signIn = async () => {
    if (!email) return toast.error("Enter any email");
    setLoading(true);
    dummySignIn(email);
    setLoading(false);
    toast.success("Welcome back!");
  };

  const signUp = async () => {
    if (!email) return toast.error("Enter any email");
    setLoading(true);
    dummySignIn(email, displayName);
    setLoading(false);
    toast.success("Account created!");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-md py-16">
        <div className="text-center mb-8">
          <Trophy className="h-12 w-12 text-accent mx-auto mb-3" />
          <h1 className="text-3xl font-bold">Join the prediction</h1>
          <p className="text-muted-foreground text-sm mt-2">Sign in or create an account to predict.</p>
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-6">
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="Password" value={password} onChange={setPassword} type="password" />
            <Button onClick={signIn} disabled={loading} className="w-full" size="lg">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6">
            <Field label="Display name" value={displayName} onChange={setDisplayName} />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="Password" value={password} onChange={setPassword} type="password" />
            <Button onClick={signUp} disabled={loading} className="w-full" size="lg">
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
