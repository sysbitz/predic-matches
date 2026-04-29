import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, dummySignIn } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Trophy, Target, ListOrdered, Gift, Bell, CheckCircle2, Smartphone } from "lucide-react";
import bdappsLogo from "@/assets/bdapps-logo.png";

const FEATURES = [
  { icon: Target, text: "প্রতি ম্যাচে ১০টি প্রশ্নের অনুমান করুন" },
  { icon: Trophy, text: "প্রতি সঠিক উত্তরে ২ পয়েন্ট জিতুন" },
  { icon: ListOrdered, text: "লাইভ লিডারবোর্ডে নিজের র‍্যাঙ্ক দেখুন" },
  { icon: Bell, text: "ম্যাচ শুরুর আগেই অনুমান লক করুন" },
  { icon: Gift, text: "টপ স্কোরারদের জন্য আকর্ষণীয় পুরস্কার" },
];

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [msisdn, setMsisdn] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate("/", { replace: true }); }, [user, navigate]);

  const signIn = () => {
    const clean = msisdn.replace(/\D/g, "");
    if (clean.length < 10) return toast.error("সঠিক মোবাইল নম্বর লিখুন");
    setLoading(true);
    dummySignIn(`${clean}@bdapps.local`, clean);
    setLoading(false);
    toast.success("স্বাগতম!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Branding + features */}
          <div className="space-y-6 order-2 lg:order-1">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-4">
                <Trophy className="h-3.5 w-3.5" />
                MegaCup 2026
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                <span className="text-gradient-gold">অনুমান করুন</span>, পয়েন্ট জিতুন!
              </h1>
              <p className="text-muted-foreground mt-3">
                বাংলাদেশের সবচেয়ে মজার ফুটবল প্রেডিকশন গেম। বন্ধুদের সাথে প্রতিদ্বন্দ্বিতা করুন এবং শীর্ষে উঠে আসুন।
              </p>
            </div>

            <ul className="space-y-3">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm md:text-base text-foreground/90 leading-relaxed">{f.text}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span>সার্ভিস সরবরাহকারী:</span>
                <img src={bdappsLogo} alt="bdapps" className="h-5 w-auto" loading="lazy" />
              </div>
              <p>যেকোনো সময় আনসাবস্ক্রাইব করতে <span className="font-mono text-foreground">STOP</span> লিখে SMS পাঠান <span className="font-mono text-foreground">21291</span> নম্বরে।</p>
            </div>
          </div>

          {/* Right: Login card */}
          <div className="order-1 lg:order-2">
            <Card className="border-accent/20 shadow-lg">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent items-center justify-center mx-auto">
                    <Smartphone className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold">সাইন ইন করুন</h2>
                  <p className="text-sm text-muted-foreground">আপনার মোবাইল নম্বর দিয়ে লগইন করুন</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">মোবাইল নম্বর</Label>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="01XXXXXXXXX"
                      value={msisdn}
                      onChange={(e) => setMsisdn(e.target.value)}
                      className="text-center text-lg tracking-wider"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">পিন (OTP)</Label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      placeholder="৪ সংখ্যার পিন"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>

                  <Button onClick={signIn} disabled={loading} className="w-full" size="lg">
                    {loading ? "লগইন হচ্ছে…" : "সাবস্ক্রাইব ও সাইন ইন"}
                  </Button>
                </div>

                {/* Pricing notice */}
                <div className="rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">দৈনিক চার্জ</span>
                    <span className="text-lg font-bold text-accent">৳ ৪ + ভ্যাট</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <span>সকল ম্যাচে আনলিমিটেড প্রেডিকশন</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <span>স্পেশাল কন্টেস্ট ও পুরস্কারে অংশগ্রহণ</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <span>অটো-রিনিউ, যেকোনো সময় বাতিলযোগ্য</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  সাইন ইন করার মাধ্যমে আপনি আমাদের <span className="underline">শর্তাবলী</span> ও <span className="underline">গোপনীয়তা নীতিতে</span> সম্মত হচ্ছেন।
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
