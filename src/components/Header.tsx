import { Link, useLocation } from "react-router-dom";
import { Trophy, ListOrdered, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, dummySignOut } from "@/hooks/useAuth";
import { toast } from "sonner";

export function Header() {
  const { user } = useAuth();
  const loc = useLocation();

  const handleSignOut = () => {
    dummySignOut();
    toast.success("সাইন আউট হয়েছে");
  };

  const navLink = (to: string, label: string, Icon: typeof Trophy) => {
    const active = loc.pathname === to;
    return (
      <Link
        to={to}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
		<header className="sticky top-0 z-50 glass border-b border-border">
			<div className="container flex items-center justify-between h-16">
				<Link to="/" className="flex items-center gap-2 font-bold text-lg">
					<img src="../assets/megacup_logo.png" alt="megacup Logo" className="h-6 w-6" />
					<span className="text-gradient-gold">মেগাকাপ ২০২৬</span>
				</Link>
				<nav className="flex items-center gap-1">
					{navLink("/", "ম্যাচ", Trophy)}
					{navLink("/leaderboard", "লিডারবোর্ড", ListOrdered)}
					{user ? (
						<>
							<Link to="/profile" className="ml-2">
								<Button variant="ghost" size="sm" className="gap-2">
									<UserIcon className="h-4 w-4" />
									<span className="hidden sm:inline">প্রোফাইল</span>
								</Button>
							</Link>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleSignOut}
								className="gap-2">
								<LogOut className="h-4 w-4" />
							</Button>
						</>
					) : (
						<Link to="/auth">
							<Button size="sm" className="gap-2 ml-2">
								<LogIn className="h-4 w-4" />
								সাইন ইন
							</Button>
						</Link>
					)}
				</nav>
			</div>
		</header>
	);
}
