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

  const signIn = () => {
    if (!email) return toast.error("ইমেইল লিখুন");
    setLoading(true);
    dummySignIn(email);
    setLoading(false);
    toast.success("স্বাগতম!");
  };

  const signUp = () => {
    if (!email) return toast.error("ইমেইল লিখুন");
    setLoading(true);
    dummySignIn(email, displayName);
    setLoading(false);
    toast.success("অ্যাকাউন্ট তৈরি হয়েছে!");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-md py-16">
        <div className="text-center mb-8">
          <Trophy className="h-12 w-12 text-accent mx-auto mb-3" />
          <h1 className="text-3xl font-bold">অনুমানে যোগ দিন</h1>
          <p className="text-muted-foreground text-sm mt-2">অনুমান করতে সাইন ইন করুন বা অ্যাকাউন্ট তৈরি করুন</p>
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">সাইন ইন</TabsTrigger>
            <TabsTrigger value="signup">সাইন আপ</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-6">
            <Field label="ইমেইল" value={email} onChange={setEmail} type="email" />
            <Field label="পাসওয়ার্ড" value={password} onChange={setPassword} type="password" />
            <Button onClick={signIn} disabled={loading} className="w-full" size="lg">
              {loading ? "লগইন হচ্ছে…" : "সাইন ইন"}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6">
            <Field label="নাম" value={displayName} onChange={setDisplayName} />
            <Field label="ইমেইল" value={email} onChange={setEmail} type="email" />
            <Field label="পাসওয়ার্ড" value={password} onChange={setPassword} type="password" />
            <Button onClick={signUp} disabled={loading} className="w-full" size="lg">
              {loading ? "তৈরি হচ্ছে…" : "অ্যাকাউন্ট তৈরি করুন"}
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
