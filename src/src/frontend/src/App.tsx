import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Gift,
  Grid2x2,
  Headphones,
  HelpCircle,
  Home,
  Loader2,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Send,
  ShoppingCart,
  Smartphone,
  Trash2,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────
type Screen =
  | "splash"
  | "login-phone"
  | "signup"
  | "forgot-phone"
  | "forgot-otp"
  | "forgot-password"
  | "home"
  | "rewards"
  | "newcomer-bonus"
  | "buy-rp"
  | "sell-rp"
  | "mine"
  | "buy-rp-record"
  | "sell-rp-record"
  | "team-management";

// ─── UPI Wallet Types ────────────────────────────────────────────────────────
type UpiWalletType = "PhonePe" | "Paytm" | "MobiKwik" | "FreeCharge";
interface UpiWallet {
  id: string;
  name: UpiWalletType;
  upiId: string;
}
interface SellTransaction {
  id: string;
  date: string;
  walletName: string;
  amount: number;
}

// ─── User Store Types ────────────────────────────────────────────────────────
type RegisteredUser = { name: string; password: string; inviteCode?: string };
type UserStore = Record<string, RegisteredUser>; // phone → user

const _WALLET_COLORS: Record<UpiWalletType, string> = {
  PhonePe: "#5f259f",
  Paytm: "#00b9f1",
  MobiKwik: "#e40046",
  FreeCharge: "#f26522",
};
const WALLET_LOGOS: Record<UpiWalletType, string> = {
  PhonePe: "/assets/generated/phonepe-logo-transparent.dim_100x100.png",
  Paytm: "/assets/generated/paytm-logo-transparent.dim_100x100.png",
  MobiKwik: "/assets/generated/mobikwik-logo-transparent.dim_100x100.png",
  FreeCharge: "/assets/generated/freecharge-logo-transparent.dim_100x100.png",
};

const _LEVELS = [
  {
    label: "L1",
    options: [
      { amount: 50, reward: 5 },
      { amount: 100, reward: 10 },
    ],
  },
  {
    label: "L2",
    options: [
      { amount: 200, reward: 20 },
      { amount: 300, reward: 30 },
    ],
  },
  {
    label: "L3",
    options: [
      { amount: 500, reward: 50 },
      { amount: 1000, reward: 100 },
    ],
  },
  {
    label: "L4",
    options: [
      { amount: 2000, reward: 200 },
      { amount: 3000, reward: 300 },
    ],
  },
  {
    label: "L5",
    options: [
      { amount: 5000, reward: 500 },
      { amount: 10000, reward: 1000 },
    ],
  },
  {
    label: "L6",
    options: [
      { amount: 15000, reward: 1500 },
      { amount: 20000, reward: 2000 },
    ],
  },
];

// ─── Screen Wrapper ──────────────────────────────────────────────────────────
function ScreenWrapper({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`min-h-screen flex flex-col ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─── Password Field ──────────────────────────────────────────────────────────
function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-muted-foreground text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "••••••••"}
          className="bg-muted border-border pr-12 h-12 rounded-xl focus:border-primary"
          data-ocid={`${id}.input`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

// ─── Bottom Nav ──────────────────────────────────────────────────────────────
function BottomNav({
  active,
  onNavigate,
}: { active: Screen; onNavigate: (s: Screen) => void }) {
  const tabs: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home size={22} /> },
    {
      id: "buy-rp",
      label: "Buy RP",
      icon: <span className="text-lg font-black">₨</span>,
    },
    {
      id: "sell-rp",
      label: "Sell RP",
      icon: <span className="text-lg font-black">💱</span>,
    },
    { id: "mine", label: "Mine", icon: <User size={22} /> },
  ];
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 z-50"
      data-ocid="home.bottom_nav.panel"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ id, label, icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => onNavigate(id)}
            className="flex flex-col items-center gap-0.5 px-4 py-1 transition-all"
            data-ocid={`nav.${id === "home" ? "home" : id === "buy-rp" ? "buy_rp" : id === "sell-rp" ? "sell_rp" : "mine"}.tab`}
          >
            <span className={active === id ? "text-blue-600" : "text-gray-400"}>
              {icon}
            </span>
            <span
              className={`text-xs font-medium ${
                active === id ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>
            {active === id && (
              <div className="w-1 h-1 rounded-full bg-blue-600" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Auth Card Layout ─────────────────────────────────────────────────────────
function AuthCard({
  children,
  title,
  subtitle,
  onBack,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <div
        className="absolute top-0 left-0 right-0 h-64 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.72 0.14 75 / 0.3) 0%, transparent 70%)",
        }}
      />
      <div className="w-full max-w-[430px]">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="auth.back_button"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Back</span>
          </button>
        )}
        <div className="mb-8">
          <img
            src="/assets/generated/wynpay-logo-transparent.dim_400x400.png"
            alt="WynPay"
            className="w-48 h-48 object-contain mb-4"
          />
          <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="card-glass rounded-2xl p-6 space-y-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Splash Screen ────────────────────────────────────────────────────────────
function SplashScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <ScreenWrapper className="items-center justify-center px-6">
      <div className="w-full max-w-[430px] flex flex-col items-center gap-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, oklch(0.72 0.14 75) 0%, transparent 70%)",
            }}
          />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
        >
          <img
            src="/assets/generated/wynpay-logo-transparent.dim_400x400.png"
            alt="WynPay"
            className="w-64 h-64 object-contain"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl font-bold gold-text tracking-tight">
            wynpay
          </h1>
          <p className="text-muted-foreground text-lg">
            Smart Payments, Simplified
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Zap size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">
              Fast · Secure · Global
            </span>
            <Zap size={14} className="text-primary" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full space-y-3"
        >
          <Button
            className="w-full h-14 text-lg font-semibold rounded-2xl gold-gradient text-background hover:opacity-90 transition-opacity shadow-gold"
            onClick={() => navigate("login-phone")}
            data-ocid="splash.login_button"
          >
            Login
          </Button>
          <Button
            variant="outline"
            className="w-full h-14 text-lg font-semibold rounded-2xl border-2 border-secondary text-secondary hover:bg-secondary/10 transition-colors"
            onClick={() => navigate("signup")}
            data-ocid="splash.signup_button"
          >
            Create Account
          </Button>
        </motion.div>
        <p className="text-xs text-muted-foreground text-center">
          By continuing, you agree to our Terms of Service &amp; Privacy Policy
        </p>
      </div>
    </ScreenWrapper>
  );
}

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({
  phone,
  setPhone,
  loginPassword,
  setLoginPassword,
  errors,
  setErrors,
  navigate,
  registeredUsers,
  setUserName,
}: {
  phone: string;
  setPhone: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
  registeredUsers: UserStore;
  setUserName: (v: string) => void;
}) {
  const validate = () => {
    const errs: Record<string, string> = {};
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10) {
      errs.phone = "Please enter a valid phone number";
    } else {
      const existing = registeredUsers[normalized];
      if (!existing) {
        errs.phone = "No account found with this number. Please sign up.";
      } else if (!loginPassword.trim()) {
        errs.password = "Please enter your password";
      } else if (existing.password !== loginPassword) {
        errs.password = "Incorrect password. Please try again.";
      }
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return false;
    }
    return true;
  };

  return (
    <ScreenWrapper>
      <AuthCard
        title="Welcome back"
        subtitle="Login to your WynPay account"
        onBack={() => navigate("splash")}
      >
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm font-medium">
            Phone Number
          </Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors({});
            }}
            placeholder="+91 98765 43210"
            className="bg-muted border-border h-12 rounded-xl focus:border-primary text-lg"
            data-ocid="login.phone.input"
          />
          {errors.phone && (
            <p
              className="text-destructive text-sm"
              data-ocid="login.phone.error_state"
            >
              {errors.phone}
            </p>
          )}
        </div>
        <PasswordField
          id="login-password"
          label="Password"
          value={loginPassword}
          onChange={(v) => {
            setLoginPassword(v);
            setErrors({});
          }}
          placeholder="Enter your password"
        />
        {errors.password && (
          <p
            className="text-destructive text-sm"
            data-ocid="login.password.error_state"
          >
            {errors.password}
          </p>
        )}
        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={() => {
            if (validate()) {
              const normalized = phone.replace(/\D/g, "");
              setUserName(registeredUsers[normalized]?.name || "User");
              navigate("home");
              toast.success("Welcome back to WynPay! 🎉");
            }
          }}
          data-ocid="login.submit.button"
        >
          Login
        </Button>
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("forgot-phone")}
            className="text-secondary hover:text-secondary/80 text-sm font-medium transition-colors"
            data-ocid="login.forgot_password.link"
          >
            Forgot Password?
          </button>
        </div>
        <div className="border-t border-border pt-4 text-center">
          <span className="text-muted-foreground text-sm">New to WynPay? </span>
          <button
            type="button"
            onClick={() => navigate("signup")}
            className="text-primary font-semibold text-sm hover:opacity-80"
            data-ocid="login.signup.link"
          >
            Create Account
          </button>
        </div>
      </AuthCard>
    </ScreenWrapper>
  );
}

// ─── Signup Screen ────────────────────────────────────────────────────────────
function SignupScreen({
  name,
  setName,
  phone,
  setPhone,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  setErrors,
  navigate,
  setUserName,
  saveUser,
  registeredUsers,
}: {
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
  setUserName: (v: string) => void;
  saveUser: (phone: string, user: RegisteredUser) => void;
  registeredUsers: UserStore;
}) {
  const handleCreate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Please enter your full name";
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10)
      errs.phone = "Please enter a valid phone number";
    else if (registeredUsers[normalized])
      errs.phone = "This phone number is already registered. Please login.";
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const newInviteCode = `WYN${Math.random().toString(36).substring(2, 5).toUpperCase()}${normalized.slice(-3)}`;
    saveUser(normalized, { name, password, inviteCode: newInviteCode });
    setUserName(name);
    navigate("home");
    toast.success(`Welcome to WynPay, ${name}! 🎉`);
  };

  return (
    <ScreenWrapper>
      <AuthCard
        title="Create account"
        subtitle="Join WynPay today"
        onBack={() => navigate("splash")}
      >
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm font-medium">
            Full Name
          </Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors({});
            }}
            placeholder="Alex Johnson"
            className="bg-muted border-border h-12 rounded-xl focus:border-primary"
            data-ocid="signup.name.input"
          />
          {errors.name && (
            <p
              className="text-destructive text-sm"
              data-ocid="signup.name.error_state"
            >
              {errors.name}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm font-medium">
            Phone Number
          </Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors({});
            }}
            placeholder="+91 98765 43210"
            className="bg-muted border-border h-12 rounded-xl focus:border-primary"
            data-ocid="signup.phone.input"
          />
          {errors.phone && (
            <p
              className="text-destructive text-sm"
              data-ocid="signup.phone.error_state"
            >
              {errors.phone}
            </p>
          )}
        </div>
        <PasswordField
          id="signup-password"
          label="Password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setErrors({});
          }}
          placeholder="At least 8 characters"
        />
        {errors.password && (
          <p
            className="text-destructive text-sm"
            data-ocid="signup.password.error_state"
          >
            {errors.password}
          </p>
        )}
        <PasswordField
          id="signup-confirm"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            setErrors({});
          }}
          placeholder="Re-enter your password"
        />
        {errors.confirm && (
          <p
            className="text-destructive text-sm"
            data-ocid="signup.confirm.error_state"
          >
            {errors.confirm}
          </p>
        )}
        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={handleCreate}
          data-ocid="signup.create_account.button"
        >
          Create Account
        </Button>
        <div className="border-t border-border pt-4 text-center">
          <span className="text-muted-foreground text-sm">
            Already have an account?{" "}
          </span>
          <button
            type="button"
            onClick={() => navigate("login-phone")}
            className="text-primary font-semibold text-sm hover:opacity-80"
            data-ocid="signup.login.link"
          >
            Login
          </button>
        </div>
      </AuthCard>
    </ScreenWrapper>
  );
}

// ─── Forgot Phone Screen ──────────────────────────────────────────────────────
function ForgotPhoneScreen({
  phone,
  setPhone,
  errors,
  setErrors,
  navigate,
  setGeneratedOtp,
  setForgotPhone,
}: {
  phone: string;
  setPhone: (v: string) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
  setGeneratedOtp: (otp: string) => void;
  setForgotPhone: (phone: string) => void;
}) {
  const validatePhone = () => {
    if (phone.replace(/\D/g, "").length < 10) {
      setErrors({ phone: "Please enter a valid phone number" });
      return false;
    }
    return true;
  };

  return (
    <ScreenWrapper>
      <AuthCard
        title="Reset password"
        subtitle="Enter your registered phone number"
        onBack={() => navigate("login-phone")}
      >
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm font-medium">
            Phone Number
          </Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors({});
            }}
            placeholder="+91 98765 43210"
            className="bg-muted border-border h-12 rounded-xl focus:border-primary"
            data-ocid="forgot.phone.input"
          />
          {errors.phone && (
            <p
              className="text-destructive text-sm"
              data-ocid="forgot.phone.error_state"
            >
              {errors.phone}
            </p>
          )}
        </div>
        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={() => {
            if (validatePhone()) {
              const otp = Math.floor(
                100000 + Math.random() * 900000,
              ).toString();
              setGeneratedOtp(otp);
              setForgotPhone(phone);
              toast.success(
                `SMS sent to ${phone}: Your verification code is ${otp}`,
              );
              navigate("forgot-otp");
            }
          }}
          data-ocid="forgot.submit.button"
        >
          Send Code
        </Button>
      </AuthCard>
    </ScreenWrapper>
  );
}

// ─── Forgot OTP Screen ────────────────────────────────────────────────────────
function ForgotOtpScreen({
  phone,
  otpInput,
  setOtpInput,
  generatedOtp,
  errors,
  setErrors,
  navigate,
  onResend,
}: {
  phone: string;
  otpInput: string;
  setOtpInput: (v: string) => void;
  generatedOtp: string;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
  onResend: () => void;
}) {
  const [resendCooldown, setResendCooldown] = useState(0);

  const startCooldown = () => {
    setResendCooldown(30);
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const maskedPhone = `+91 ******${phone.slice(-4)}`;

  return (
    <ScreenWrapper>
      <AuthCard
        title="Verify Phone"
        subtitle={`Code sent to ${maskedPhone}`}
        onBack={() => navigate("forgot-phone")}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="text-primary" size={28} />
            </div>
            <p className="text-muted-foreground text-sm text-center">
              Enter the 6-digit code we sent to
              <br />
              <span className="text-foreground font-semibold">
                {maskedPhone}
              </span>
            </p>
          </div>

          <InputOTP
            maxLength={6}
            value={otpInput}
            onChange={(v) => {
              setOtpInput(v);
              setErrors({});
            }}
            data-ocid="forgot.otp.input"
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot
                index={0}
                className="w-11 h-12 rounded-xl border-border bg-muted text-lg font-bold"
              />
              <InputOTPSlot
                index={1}
                className="w-11 h-12 rounded-xl border-border bg-muted text-lg font-bold"
              />
              <InputOTPSlot
                index={2}
                className="w-11 h-12 rounded-xl border-border bg-muted text-lg font-bold"
              />
              <InputOTPSlot
                index={3}
                className="w-11 h-12 rounded-xl border-border bg-muted text-lg font-bold"
              />
              <InputOTPSlot
                index={4}
                className="w-11 h-12 rounded-xl border-border bg-muted text-lg font-bold"
              />
              <InputOTPSlot
                index={5}
                className="w-11 h-12 rounded-xl border-border bg-muted text-lg font-bold"
              />
            </InputOTPGroup>
          </InputOTP>

          {errors.otp && (
            <p
              className="text-destructive text-sm text-center"
              data-ocid="forgot.otp.error_state"
            >
              {errors.otp}
            </p>
          )}
        </div>

        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={() => {
            if (otpInput.length !== 6) {
              setErrors({ otp: "Please enter the complete 6-digit code" });
              return;
            }
            if (otpInput !== generatedOtp) {
              setErrors({ otp: "Invalid code. Please try again." });
              return;
            }
            navigate("forgot-password");
          }}
          data-ocid="forgot.otp.submit_button"
        >
          Verify Code
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {"Didn't receive it? "}
          {resendCooldown > 0 ? (
            <span className="text-muted-foreground">
              Resend in {resendCooldown}s
            </span>
          ) : (
            <button
              type="button"
              className="text-primary font-semibold hover:opacity-80"
              onClick={() => {
                onResend();
                startCooldown();
              }}
              data-ocid="forgot.otp.resend_button"
            >
              Resend Code
            </button>
          )}
        </div>
      </AuthCard>
    </ScreenWrapper>
  );
}

// ─── Forgot Password Screen ───────────────────────────────────────────────────
function ForgotPasswordScreen({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  setErrors,
  navigate,
  forgotPhone,
  registeredUsers,
  saveUser,
}: {
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
  forgotPhone: string;
  registeredUsers: UserStore;
  saveUser: (phone: string, user: RegisteredUser) => void;
}) {
  return (
    <ScreenWrapper>
      <AuthCard
        title="New password"
        subtitle="Create a new password"
        onBack={() => navigate("forgot-otp")}
      >
        <PasswordField
          id="forgot-new-password"
          label="New Password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setErrors({});
          }}
          placeholder="At least 8 characters"
        />
        {errors.password && (
          <p
            className="text-destructive text-sm"
            data-ocid="forgot.password.error_state"
          >
            {errors.password}
          </p>
        )}
        <PasswordField
          id="forgot-confirm"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            setErrors({});
          }}
        />
        {errors.confirm && (
          <p
            className="text-destructive text-sm"
            data-ocid="forgot.confirm.error_state"
          >
            {errors.confirm}
          </p>
        )}
        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={() => {
            const errs: Record<string, string> = {};
            if (password.length < 8)
              errs.password = "Password must be at least 8 characters";
            if (password !== confirmPassword)
              errs.confirm = "Passwords do not match";
            if (Object.keys(errs).length) {
              setErrors(errs);
              return;
            }
            // Update stored password for this phone number
            const normalizedPhone = forgotPhone.replace(/\D/g, "");
            const existingUser = registeredUsers[normalizedPhone];
            if (existingUser) {
              saveUser(forgotPhone, { ...existingUser, password });
            }
            navigate("login-phone");
            toast.success("Password reset successfully! Please login.");
          }}
          data-ocid="forgot.reset_password.button"
        >
          Reset Password
        </Button>
      </AuthCard>
    </ScreenWrapper>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({
  userName,
  buyQuantity,
  buyAmount,
  sellAmount,
  totalRevenue,
  navigate,
}: {
  userName: string;
  buyQuantity: number;
  buyAmount: number;
  sellAmount: number;
  totalRevenue: number;
  navigate: (s: Screen) => void;
}) {
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setBannerIndex((i) => (i + 1) % 2), 3500);
    return () => clearInterval(t);
  }, []);

  const banners = [
    {
      bg: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
      title: "INVITE FRIENDS",
      sub: "To unlock cash benefits",
      btn: "Invite Now",
      emoji: "🎁",
    },
    {
      bg: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)",
      title: "Buy RP Coins",
      sub: "Safe · Fast · Convenient",
      btn: "Buy Now",
      emoji: "🪙",
    },
  ];

  const statsItems = [
    {
      label: "Buy Quantity",
      value: buyQuantity.toString(),
      icon: "🛒",
      sub: "transactions",
    },
    {
      label: "Buy Amount",
      value: `₹${buyAmount.toFixed(1)}`,
      icon: "💰",
      sub: "spent",
    },
    {
      label: "Sell Amount",
      value: `₹${sellAmount.toFixed(1)}`,
      icon: "💱",
      sub: "received",
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toFixed(1)}`,
      icon: "📈",
      sub: "earned",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-50"
    >
      {/* Header */}
      <header className="px-4 pt-10 pb-3 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/wynpay-logo-transparent.dim_400x400.png"
            alt="WynPay"
            className="w-20 h-20 object-contain"
          />
          <span className="text-lg font-bold gold-text">wynpay</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Hi, {userName.split(" ")[0]} 👋
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 space-y-4 overflow-y-auto pt-3">
        {/* Banner Carousel */}
        <div
          className="relative rounded-2xl overflow-hidden h-32"
          data-ocid="home.banner.panel"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={bannerIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-between px-6"
              style={{ background: banners[bannerIndex].bg }}
            >
              <div className="text-white">
                <div className="text-lg font-black leading-tight">
                  {banners[bannerIndex].title}
                </div>
                <div className="text-xs opacity-90 mt-0.5">
                  {banners[bannerIndex].sub}
                </div>
                <button
                  type="button"
                  className="mt-2 px-4 py-1.5 bg-white/25 hover:bg-white/35 text-white text-xs font-bold rounded-full transition-colors"
                  data-ocid="home.banner.button"
                  onClick={() => {
                    if (bannerIndex === 0) navigate("team-management");
                    if (bannerIndex === 1) navigate("buy-rp");
                  }}
                >
                  {banners[bannerIndex].btn}
                </button>
              </div>
              <div className="text-5xl">{banners[bannerIndex].emoji}</div>
            </motion.div>
          </AnimatePresence>
          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {[0, 1].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBannerIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  bannerIndex === i ? "bg-white w-4" : "bg-white/50"
                }`}
                data-ocid={`home.banner.pagination.${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Newcomer Bonus Card */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
          data-ocid="home.newcomer_bonus.card"
        >
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
              🎉 Welcome Offer
            </p>
            <h3 className="text-base font-black text-gray-800 mt-0.5">
              Newcomer Bonus
            </h3>
            <p className="text-blue-600 font-bold text-sm">Up to Rs. 800!</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("newcomer-bonus")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors"
            data-ocid="home.newcomer_bonus.button"
          >
            Click to enter
          </button>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          data-ocid="home.stats.card"
        >
          <div className="grid grid-cols-2 gap-3">
            {statsItems.map((item, idx) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-2 rounded-xl bg-gray-50"
                data-ocid={`home.stats.item.${idx + 1}`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 truncate">{item.label}</p>
                  <p className="text-base font-black text-gray-800">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 w-full text-right text-xs text-blue-600 font-semibold"
            data-ocid="home.stats.more.button"
          >
            More &gt;
          </button>
        </motion.div>

        {/* Tutorial */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
            Tutorial
          </h3>
          <div
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
            data-ocid="home.tutorial.card"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl flex-shrink-0">
              📖
            </div>
            <div>
              <p className="font-bold text-gray-800">Purchase Introduction</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Learn how to buy &amp; sell RP coins safely
              </p>
            </div>
            <ShoppingCart
              size={18}
              className="ml-auto text-gray-300 flex-shrink-0"
            />
          </div>
        </motion.div>

        {/* Rewards shortcut */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="button"
            onClick={() => navigate("rewards")}
            className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
            data-ocid="home.earn_rp.button"
          >
            <span className="text-2xl">🪙</span>
            <div className="text-left">
              <p className="font-black text-white text-sm">Earn RP Coins</p>
              <p className="text-xs text-white/80">
                Complete tasks to earn rewards
              </p>
            </div>
            <TrendingUp size={18} className="ml-auto text-white/80" />
          </button>
        </motion.div>
      </main>

      <BottomNav active="home" onNavigate={navigate} />

      <div className="pb-20" />
      <footer className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] text-center pb-1">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </motion.div>
  );
}

// ─── Rewards Screen ───────────────────────────────────────────────────────────
function RewardsScreen({
  rpCoins,
  navigate,
}: {
  rpCoins: number;
  navigate: (s: Screen) => void;
}) {
  const tasks = [
    { coins: 10, label: "Order Rewards", progress: 0, target: 10 },
    { coins: 30, label: "Order Rewards", progress: 0, target: 30 },
    { coins: 50, label: "Order Rewards", progress: 0, target: 50 },
    { coins: 100, label: "Order Rewards", progress: 0, target: 100 },
    { coins: 100, label: "Order Rewards", progress: 0, target: 150 },
    { coins: 100, label: "Order Rewards", progress: 0, target: 200 },
    { coins: 800, label: "Total purchase reward", progress: 0, target: 300000 },
    {
      coins: 1000,
      label: "Total purchase reward",
      progress: 0,
      target: 500000,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-50"
    >
      {/* Header */}
      <div
        className="pt-10 pb-6 px-4 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #dbeafe 0%, #e0f2fe 50%, #f0f9ff 100%)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center"
            data-ocid="rewards.back.button"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-gray-600 font-semibold">Earn RP</span>
          <span className="text-lg">🪙</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-5xl font-black text-gray-800">{rpCoins}</p>
            <p className="text-sm text-gray-500 mt-1">Total RP Coins</p>
          </div>
          <div className="text-6xl opacity-60">🗂️</div>
        </div>
      </div>

      <main className="flex-1 px-4 pb-24 pt-4 overflow-y-auto">
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
          data-ocid="rewards.daily_tasks.card"
        >
          <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <h2 className="font-black text-gray-800">Daily Tasks</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {tasks.map((task, i) => (
              <div
                key={task.target}
                className="flex items-center gap-3 px-4 py-3"
                data-ocid={`rewards.task.item.${i + 1}`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #fce7f3, #ede9fe)",
                  }}
                >
                  <span className="text-base">🪙</span>
                  <span className="text-xs font-black text-purple-700">
                    +{task.coins >= 1000 ? `${task.coins / 1000}K` : task.coins}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">
                    {task.label}
                  </p>
                  <p className="text-xs text-gray-400">
                    {task.progress}/{task.target}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toast("Task not yet complete", { icon: "⏳" })}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-colors flex-shrink-0"
                  data-ocid={`rewards.receive.button.${i + 1}`}
                >
                  Receive
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav active="rewards" onNavigate={navigate} />
    </motion.div>
  );
}

// ─── Newcomer Bonus Screen ────────────────────────────────────────────────────
function NewcomerBonusScreen({
  buyQuantity,
  buyAmount,
  navigate,
}: {
  buyQuantity: number;
  buyAmount: number;
  navigate: (s: Screen) => void;
}) {
  const qtyProgress = (buyQuantity / 10) * 100;
  const amtProgress = (buyAmount / 5000) * 100;
  const canClaim = buyQuantity >= 10 && buyAmount >= 5000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-50"
    >
      <div className="px-4 pt-10 pb-4 bg-white shadow-sm flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          data-ocid="newcomer.back.button"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <h1 className="font-black text-gray-800 text-lg">Newcomer Bonus</h1>
      </div>

      <main className="flex-1 px-4 py-6 space-y-5">
        {/* Task Introduction Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4">
            <h3 className="text-lg font-black text-gray-800 mb-3">
              1. Task Introduction
            </h3>
            <div className="flex gap-3">
              {/* Phone mockup illustration */}
              <div className="w-28 flex-shrink-0 bg-gray-800 rounded-2xl p-1.5 shadow-md">
                <div className="bg-blue-600 rounded-xl p-2 h-full min-h-[100px]">
                  <div className="flex gap-1 mb-1.5">
                    {["L1", "L2", "L3", "L4", "L5", "L6"].map((l) => (
                      <span
                        key={l}
                        className="text-[6px] bg-blue-400 text-white rounded px-0.5 font-bold"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded mb-1 p-1 flex justify-between items-center"
                    >
                      <span className="text-[5px] text-gray-600">
                        Payment: 100.0RP
                      </span>
                      <span className="text-[5px] bg-blue-500 text-white rounded px-0.5">
                        Receive
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Callout text */}
              <div className="flex-1 bg-blue-50 rounded-xl p-3 border border-blue-100 relative">
                <p className="text-xs text-gray-700 leading-relaxed">
                  You can purchase orders of different levels. After receiving
                  the order, it must be completed within the specified time,
                  otherwise the order will be automatically cancelled.
                </p>
                {/* Arrow */}
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-blue-100" />
              </div>
            </div>
          </div>
        </div>

        {/* About the Team Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4">
            <h3 className="text-lg font-black text-gray-800 mb-3">
              3. About the Team
            </h3>
            <div className="flex gap-3">
              {/* Phone mockup illustration */}
              <div className="w-28 flex-shrink-0 bg-gray-800 rounded-2xl p-1.5 shadow-md">
                <div className="bg-blue-600 rounded-xl p-2 h-full min-h-[100px]">
                  <div className="bg-white/20 rounded p-1 mb-1.5">
                    <p className="text-[5px] text-white font-bold">
                      My total commission
                    </p>
                    <p className="text-[8px] text-white font-black">81.18</p>
                  </div>
                  <div className="bg-white rounded p-1 mb-1">
                    <p className="text-[5px] text-gray-500 mb-0.5">
                      Invite Link
                    </p>
                    <div className="bg-gray-100 rounded px-1 py-0.5 flex justify-between">
                      <span className="text-[4px] text-gray-600">
                        https://wynpay...
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded p-1">
                    <div className="grid grid-cols-4 gap-0.5">
                      {["Tg", "Fb", "Wa", "QR"].map((i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full bg-teal-400 flex items-center justify-center"
                        >
                          <span className="text-[4px] text-white">{i[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Callout text */}
              <div className="flex-1 bg-blue-50 rounded-xl p-3 border border-blue-100 relative">
                <p className="text-xs text-gray-700 leading-relaxed">
                  Share the invitation code and invite friends to join your
                  team. After your team members complete the order, you will
                  receive a certain percentage of the rebate.
                </p>
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-blue-100" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white text-center">
          <div className="text-5xl mb-3">🎁</div>
          <h2 className="text-2xl font-black">400 Tokens</h2>
          <p className="text-sm opacity-90 mt-1">
            Complete both conditions to claim your reward!
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-700 text-sm text-center">
            Complete <strong>10 buy transactions</strong> AND spend{" "}
            <strong>Rs. 5000</strong> to claim your <strong>400 token</strong>{" "}
            reward!
          </p>
        </div>

        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5"
          data-ocid="newcomer.progress.card"
        >
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                🛒 Buy Quantity
              </span>
              <span className="text-sm font-bold text-blue-600">
                {buyQuantity} / 10 transactions
              </span>
            </div>
            <Progress
              value={qtyProgress}
              className="h-3 rounded-full"
              data-ocid="newcomer.qty_progress.panel"
            />
            <p className="text-xs text-gray-400 mt-1">
              {10 - buyQuantity} more transactions needed
            </p>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                💰 Buy Amount
              </span>
              <span className="text-sm font-bold text-blue-600">
                ₹{buyAmount.toFixed(0)} / ₹5,000
              </span>
            </div>
            <Progress
              value={amtProgress}
              className="h-3 rounded-full"
              data-ocid="newcomer.amount_progress.panel"
            />
            <p className="text-xs text-gray-400 mt-1">
              ₹{(5000 - buyAmount).toFixed(0)} more spending needed
            </p>
          </div>
        </div>

        <Button
          disabled={!canClaim}
          className={`w-full h-14 rounded-2xl text-lg font-black transition-all ${
            canClaim
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          data-ocid="newcomer.claim.button"
        >
          {canClaim ? "🎉 Claim 400 Tokens" : "🔒 Claim 400 Tokens"}
        </Button>
      </main>
    </motion.div>
  );
}

// ─── Buy RP Transaction Data ─────────────────────────────────────────────────
const ALL_LEVELS = [
  {
    label: "L1",
    options: [
      { amount: 50, reward: 5 },
      { amount: 100, reward: 10 },
    ],
  },
  {
    label: "L2",
    options: [
      { amount: 200, reward: 20 },
      { amount: 300, reward: 30 },
    ],
  },
  {
    label: "L3",
    options: [
      { amount: 500, reward: 50 },
      { amount: 1000, reward: 100 },
    ],
  },
  {
    label: "L4",
    options: [
      { amount: 2000, reward: 200 },
      { amount: 3000, reward: 300 },
    ],
  },
  {
    label: "L5",
    options: [
      { amount: 5000, reward: 500 },
      { amount: 10000, reward: 1000 },
    ],
  },
  {
    label: "L6",
    options: [
      { amount: 15000, reward: 1500 },
      { amount: 20000, reward: 2000 },
    ],
  },
];

function generateId(): string {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
}

type TxEntry = {
  id: string;
  payment: number;
  award: number;
  orderQty: number;
  received: boolean;
};

const LEVEL_TRANSACTIONS: TxEntry[][] = ALL_LEVELS.map((lv, lvIdx) => {
  const entries: TxEntry[] = [];
  for (let i = 0; i < 9; i++) {
    const opt = lv.options[i % 2];
    entries.push({
      id: generateId(),
      payment: opt.amount,
      award: opt.reward,
      orderQty: Math.floor(((lvIdx * 7 + i * 37 + opt.amount) % 500) + 1),
      received: false,
    });
  }
  return entries;
});

// ─── UPI Payment Modal ────────────────────────────────────────────────────────
const UPI_IDS = ["Chanchal.68@ybl", "Chanchal.68@ibl", "Chanchal.68@axl"];

function UpiPaymentModal({
  payment,
  onPay,
  onCancel,
}: {
  payment: number;
  onPay: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"choose" | "processing" | "success">(
    "choose",
  );
  const [timeLeft, setTimeLeft] = useState(120);
  const proceededRef = useRef(false);
  const onPayRef = useRef(onPay);
  onPayRef.current = onPay;

  const handleProceed = useCallback(async () => {
    if (proceededRef.current) return;
    proceededRef.current = true;
    setStep("processing");
    await new Promise((r) => setTimeout(r, 1500));
    setStep("success");
    await new Promise((r) => setTimeout(r, 1000));
    onPayRef.current();
  }, []);

  useEffect(() => {
    if (step !== "choose") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, handleProceed]);

  const handleCopyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi).catch(() => {});
    toast.success("Copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget && step === "choose") onCancel();
      }}
    >
      <motion.div
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 300, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 280 }}
        className="w-full max-w-sm bg-white rounded-t-3xl overflow-hidden shadow-2xl"
      >
        {/* PhonePe Header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ background: "#5f259f" }}
        >
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <Smartphone size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">
              PhonePe
            </p>
            <p className="text-white/70 text-xs">UPI Payment</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-5 pb-6">
          {step === "choose" && (
            <>
              {/* Amount */}
              <div className="text-center mb-5">
                <p className="text-gray-500 text-sm mb-1">Pay Amount</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  Rs. {payment}
                </p>
              </div>

              {/* UPI IDs */}
              <div className="mb-5">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  Send money to
                </p>
                <div className="space-y-2">
                  {UPI_IDS.map((upi, i) => (
                    <div
                      key={upi}
                      className="flex items-center gap-3 bg-purple-50 rounded-xl px-3 py-2.5"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: "#5f259f" }}
                      >
                        {i + 1}
                      </div>
                      <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                        {upi}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyUpi(upi)}
                        className="text-purple-600 hover:text-purple-800 transition-colors flex-shrink-0"
                        title="Copy UPI ID"
                      >
                        <Copy size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500 font-medium">
                    Auto-checking payment
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#5f259f" }}
                  >
                    {String(Math.floor(timeLeft / 60)).padStart(1, "0")}:
                    {String(timeLeft % 60).padStart(2, "0")}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      background: "#5f259f",
                      width: `${(timeLeft / 120) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Payment verification in progress...
                </p>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="w-full mt-4 py-3 rounded-xl border-2 border-red-400 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
                data-ocid="upi_payment.cancel_button"
              >
                Cancel Order
              </button>
            </>
          )}

          {step === "processing" && (
            <div
              className="flex flex-col items-center py-10 gap-4"
              data-ocid="upi_payment.loading_state"
            >
              <Loader2
                size={48}
                className="animate-spin"
                style={{ color: "#5f259f" }}
              />
              <p className="text-gray-700 font-semibold text-base">
                Processing payment...
              </p>
              <p className="text-gray-400 text-sm">Please wait</p>
            </div>
          )}

          {step === "success" && (
            <div
              className="flex flex-col items-center py-10 gap-3"
              data-ocid="upi_payment.success_state"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircle size={56} className="text-green-500" />
              </motion.div>
              <p className="text-gray-800 font-bold text-xl">
                Payment Successful!
              </p>
              <p className="text-gray-500 text-sm text-center">
                Your RP will be credited shortly
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Clipboard Empty State ────────────────────────────────────────────────────
function ClipboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <svg
        viewBox="0 0 200 200"
        width="160"
        height="160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="No orders illustration"
      >
        {/* Cloud top-left */}
        <ellipse cx="38" cy="42" rx="14" ry="9" fill="#e2e8f0" />
        <ellipse cx="28" cy="46" rx="10" ry="7" fill="#e2e8f0" />
        <ellipse cx="50" cy="46" rx="10" ry="7" fill="#e2e8f0" />
        {/* Paper plane top-right */}
        <g transform="translate(148, 28) rotate(-30)">
          <polygon points="0,0 24,8 8,20" fill="#cbd5e1" />
          <polygon points="0,0 8,20 4,12" fill="#94a3b8" />
          <line
            x1="8"
            y1="20"
            x2="14"
            y2="14"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
        </g>
        {/* Clipboard body */}
        <rect
          x="55"
          y="55"
          width="90"
          height="110"
          rx="8"
          fill="#f1f5f9"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        {/* Clipboard clip at top */}
        <rect
          x="80"
          y="48"
          width="40"
          height="16"
          rx="6"
          fill="#e2e8f0"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <rect x="88" y="52" width="24" height="8" rx="4" fill="#cbd5e1" />
        {/* Lines on clipboard */}
        <line
          x1="70"
          y1="85"
          x2="130"
          y2="85"
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="70"
          y1="100"
          x2="130"
          y2="100"
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="70"
          y1="115"
          x2="115"
          y2="115"
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Paper peeking from bottom */}
        <rect
          x="65"
          y="148"
          width="70"
          height="22"
          rx="4"
          fill="#e2e8f0"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <line
          x1="75"
          y1="156"
          x2="120"
          y2="156"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="75"
          y1="163"
          x2="110"
          y2="163"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Small checkmark circle */}
        <circle cx="100" cy="135" r="10" fill="#e2e8f0" />
        <path
          d="M95 135 L98 138 L105 131"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-gray-400 text-sm font-medium mt-2 text-center">
        There are currently no orders
      </p>
    </div>
  );
}

// ─── Buy RP Record Screen ─────────────────────────────────────────────────────
function BuyRPRecordScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const tabs = ["Unfinished", "Bank lock", "Locked", "Success", "Fail"];
  const [activeTab, setActiveTab] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-100"
      data-ocid="buy_rp_record.page"
    >
      {/* Header */}
      <header className="px-4 pt-10 pb-3 bg-white shadow-sm flex items-center gap-3">
        <button
          type="button"
          data-ocid="buy_rp_record.back.button"
          onClick={() => navigate("buy-rp")}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <span className="flex-1 font-bold text-gray-800 text-base text-center pr-8">
          Buy RP record
        </span>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              type="button"
              data-ocid={`buy_rp_record.tab.${i + 1}`}
              onClick={() => setActiveTab(i)}
              className={`flex-shrink-0 px-5 py-3 text-sm relative transition-colors ${
                activeTab === i
                  ? "font-bold text-gray-900"
                  : "font-normal text-gray-400"
              }`}
            >
              {tab}
              {activeTab === i && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <ClipboardEmptyState />
      </main>
    </motion.div>
  );
}

// ─── Sell RP Record Screen ────────────────────────────────────────────────────
interface RandomSellOrder {
  id: string;
  amount: number;
  createdAt: number;
  accepted: boolean;
}

function SellRPRecordScreen({
  navigate,
  currentBalance,
}: {
  navigate: (s: Screen) => void;
  currentBalance: number;
}) {
  const tabs = [
    "Unknown order",
    "Unfinished",
    "Bank lock",
    "Locked",
    "Success",
  ];
  const [activeTab, setActiveTab] = useState(0);
  const [randomOrders, setRandomOrders] = useState<RandomSellOrder[]>(() => [
    {
      id: `order-${Date.now()}`,
      amount: Math.max(100, currentBalance),
      createdAt: Date.now(),
      accepted: false,
    },
  ]);
  const [acceptedOrders, setAcceptedOrders] = useState<RandomSellOrder[]>([]);

  // Remove expired orders every second
  useEffect(() => {
    const cleanup = setInterval(() => {
      setRandomOrders((prev) =>
        prev.filter((o) => Date.now() - o.createdAt < 120000),
      );
    }, 1000);
    return () => clearInterval(cleanup);
  }, []);

  // Add a new random order every 2 minutes
  useEffect(() => {
    const generator = setInterval(() => {
      setRandomOrders((prev) => [
        ...prev,
        {
          id: `order-${Date.now()}`,
          amount: Math.max(100, currentBalance),
          createdAt: Date.now(),
          accepted: false,
        },
      ]);
    }, 120000);
    return () => clearInterval(generator);
  }, [currentBalance]);

  const handleAccept = (order: RandomSellOrder) => {
    if (currentBalance < 100) return;
    setRandomOrders((prev) => prev.filter((o) => o.id !== order.id));
    setAcceptedOrders((prev) => [...prev, { ...order, accepted: true }]);
    toast.success("Order accepted! 🎉");
  };

  const activeOrders = randomOrders.filter((o) => !o.accepted);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-100"
      data-ocid="sell_rp_record.page"
    >
      {/* Header */}
      <header className="px-4 pt-10 pb-3 bg-white shadow-sm flex items-center gap-3">
        <button
          type="button"
          data-ocid="sell_rp_record.back.button"
          onClick={() => navigate("sell-rp")}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <span className="flex-1 font-bold text-gray-800 text-base text-center pr-8">
          Sell RP record
        </span>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              type="button"
              data-ocid={`sell_rp_record.tab.${i + 1}`}
              onClick={() => setActiveTab(i)}
              className={`flex-shrink-0 px-5 py-3 text-sm relative transition-colors ${
                activeTab === i
                  ? "font-bold text-gray-900"
                  : "font-normal text-gray-400"
              }`}
            >
              {tab}
              {activeTab === i && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {activeTab === 0 &&
          (activeOrders.length === 0 ? (
            <ClipboardEmptyState />
          ) : (
            activeOrders.map((order, idx) => {
              const canAccept = currentBalance >= 100;
              return (
                <div
                  key={order.id}
                  data-ocid={`sell_rp_record.order.item.${idx + 1}`}
                  className="bg-white rounded-xl shadow-sm px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">
                        Sell Order
                      </p>
                      <p className="text-xl font-black text-teal-600">
                        ₹{order.amount}.00
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        data-ocid={`sell_rp_record.accept.button.${idx + 1}`}
                        disabled={!canAccept}
                        onClick={() => handleAccept(order)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                          canAccept
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Accept
                      </button>
                      {!canAccept && (
                        <p className="text-[10px] text-red-400 text-right">
                          Min. ₹100 balance required
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ))}

        {activeTab === 1 &&
          (acceptedOrders.length === 0 ? (
            <ClipboardEmptyState />
          ) : (
            acceptedOrders.map((order, idx) => (
              <div
                key={order.id}
                data-ocid={`sell_rp_record.unfinished.item.${idx + 1}`}
                className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-0.5">
                    Sell Order
                  </p>
                  <p className="text-xl font-black text-teal-600">
                    ₹{order.amount}.00
                  </p>
                </div>
                <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
                  Processing...
                </span>
              </div>
            ))
          ))}

        {(activeTab === 2 || activeTab === 3 || activeTab === 4) && (
          <ClipboardEmptyState />
        )}
      </main>
    </motion.div>
  );
}

// ─── Buy RP Screen ────────────────────────────────────────────────────────────
function BuyRPScreen({
  navigate,
  setBuyQuantity,
  setBuyAmount,
  setRpCoins,
}: {
  navigate: (s: Screen) => void;
  setBuyQuantity: React.Dispatch<React.SetStateAction<number>>;
  setBuyAmount: React.Dispatch<React.SetStateAction<number>>;
  setRpCoins: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [activeLevel, setActiveLevel] = useState(0);
  const [payingTx, setPayingTx] = useState<{
    idx: number;
    payment: number;
    award: number;
  } | null>(null);
  const [txData, setTxData] = useState<TxEntry[][]>(() =>
    LEVEL_TRANSACTIONS.map((lvl) => lvl.map((tx) => ({ ...tx }))),
  );
  const [sortOrder, setSortOrder] = useState<"low-to-high" | "high-to-low">(
    "low-to-high",
  );

  const handleReceive = (txIdx: number) => {
    const tx = txData[activeLevel][txIdx];
    if (tx.received) return;
    setBuyQuantity((prev) => prev + 1);
    setBuyAmount((prev) => prev + tx.payment);
    setRpCoins((prev) => prev + tx.award);
    toast.success(`+${tx.award} RP received! 🎉`);
    setTxData((prev) => {
      const next = prev.map((lvl) => lvl.map((t) => ({ ...t })));
      next[activeLevel][txIdx].received = true;
      return next;
    });
  };

  const handleRefresh = () => {
    setTxData((prev) => {
      const next = prev.map((lvl, lvIdx) =>
        lvl.map((tx, i) => ({
          ...tx,
          orderQty: Math.floor(
            ((lvIdx * 11 + i * 41 + tx.payment + (Date.now() % 100)) % 500) + 1,
          ),
        })),
      );
      return next;
    });
    toast.success("Refreshed!");
  };

  const sortedTxData = [...txData[activeLevel]].sort((a, b) =>
    sortOrder === "low-to-high" ? a.payment - b.payment : b.payment - a.payment,
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-white"
      data-ocid="buy_rp.page"
    >
      {/* Teal header with level tabs */}
      <header
        className="pt-10 pb-0 flex flex-col gap-0"
        style={{ background: "#0f766e" }}
      >
        <div className="flex items-center gap-2 px-4 pb-3">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
            data-ocid="buy_rp.back.button"
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <h1 className="flex-1 font-bold text-white text-base">Buy RP</h1>
          <button
            type="button"
            onClick={() => navigate("buy-rp-record")}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
            data-ocid="buy_rp.list.button"
          >
            <TrendingUp size={16} className="text-white" />
          </button>
        </div>
        {/* Level tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {ALL_LEVELS.map((lv, i) => (
            <button
              key={lv.label}
              type="button"
              onClick={() => setActiveLevel(i)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeLevel === i
                  ? "bg-white text-teal-800"
                  : "bg-transparent border border-white/50 text-white hover:bg-white/10"
              }`}
              data-ocid={`buy_rp.tab.${i + 1}`}
            >
              {lv.label}
            </button>
          ))}
        </div>
      </header>

      {/* Filter bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
        <button
          type="button"
          onClick={() =>
            setSortOrder((prev) =>
              prev === "low-to-high" ? "high-to-low" : "low-to-high",
            )
          }
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium ${sortOrder === "low-to-high" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700"}`}
          data-ocid="buy_rp.sort.toggle"
        >
          {sortOrder === "low-to-high"
            ? "From low to high"
            : "From high to low"}
          <ChevronDown size={12} />
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-teal-600 text-white text-xs font-semibold"
          data-ocid="buy_rp.refresh.button"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Transaction list */}
      <main
        className="flex-1 overflow-y-auto pb-24 bg-white"
        data-ocid="buy_rp.list"
      >
        {sortedTxData.map((tx, idx) => {
          // Find real index in txData[activeLevel] for handleReceive
          const realIdx = txData[activeLevel].findIndex((t) => t.id === tx.id);
          const finalAmount = (tx.payment + tx.award + 2).toFixed(2);
          return (
            <div key={tx.id} data-ocid={`buy_rp.item.${idx + 1}`}>
              <div className="flex items-center justify-between px-4 py-4">
                {/* Left side */}
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-900 text-base">
                    Order amount: {tx.payment}.0
                  </span>
                  <span className="text-sm text-gray-500">
                    Order quantity: {tx.orderQty}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">Reward: </span>
                    <span className="text-sm font-bold text-gray-900">
                      {tx.award}.0
                    </span>
                    <sup className="text-xs font-bold text-teal-600">+2.0</sup>
                  </div>
                </div>
                {/* Right side */}
                <div className="flex flex-col items-end gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      !tx.received &&
                      setPayingTx({
                        idx: realIdx,
                        payment: tx.payment,
                        award: tx.award,
                      })
                    }
                    disabled={tx.received}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                      tx.received
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                    data-ocid={`buy_rp.item.${idx + 1}.button`}
                  >
                    {tx.received ? "Received" : "Receive"}
                  </button>
                  <span className="text-xs font-bold text-green-600">
                    Final: {finalAmount} RP
                  </span>
                </div>
              </div>
              {idx < sortedTxData.length - 1 && (
                <div className="h-px bg-gray-100 mx-4" />
              )}
            </div>
          );
        })}
      </main>

      <AnimatePresence>
        {payingTx !== null && (
          <UpiPaymentModal
            payment={payingTx.payment}
            onPay={() => {
              handleReceive(payingTx.idx);
              setPayingTx(null);
            }}
            onCancel={() => setPayingTx(null)}
          />
        )}
      </AnimatePresence>
      <BottomNav active="buy-rp" onNavigate={navigate} />
    </motion.div>
  );
}

// ─── Placeholder Screen ───────────────────────────────────────────────────────
// ─── Sell RP Screen ──────────────────────────────────────────────────────────
function SellRPScreen({
  navigate,
  upiWallets,
  setUpiWallets,
  sellTransactions,
}: {
  navigate: (s: Screen) => void;
  upiWallets: UpiWallet[];
  setUpiWallets: React.Dispatch<React.SetStateAction<UpiWallet[]>>;
  sellTransactions: SellTransaction[];
}) {
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [selectedWalletType, setSelectedWalletType] =
    useState<UpiWalletType | null>(null);
  const [upiInput, setUpiInput] = useState("");
  const [addError, setAddError] = useState("");

  const todayTotal = sellTransactions
    .filter((tx) => {
      const today = new Date().toDateString();
      return new Date(tx.date).toDateString() === today;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleAddWallet = () => {
    if (!selectedWalletType) {
      setAddError("Please select a wallet type.");
      return;
    }
    if (!upiInput.trim()) {
      setAddError("Please enter your UPI ID.");
      return;
    }
    const newWallet: UpiWallet = {
      id: Date.now().toString(),
      name: selectedWalletType,
      upiId: upiInput.trim(),
    };
    setUpiWallets((prev) => [...prev, newWallet]);
    setShowAddWallet(false);
    setSelectedWalletType(null);
    setUpiInput("");
    setAddError("");
    toast.success(`${selectedWalletType} wallet added!`);
  };

  const handleDeleteWallet = (id: string) => {
    setUpiWallets((prev) => prev.filter((w) => w.id !== id));
    toast.success("Wallet removed.");
  };

  const walletTypes: UpiWalletType[] = [
    "PhonePe",
    "Paytm",
    "MobiKwik",
    "FreeCharge",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-50"
    >
      {/* Header */}
      <header className="px-4 pt-10 pb-3 bg-white shadow-sm flex items-center gap-3">
        <button
          type="button"
          data-ocid="sell_rp.back.button"
          onClick={() => navigate("home")}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <span className="font-black text-gray-800 text-lg">Sell RP</span>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-5">
        {/* Today's Overview Card */}
        <div
          className="rounded-2xl p-4 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #e8f4fd 0%, #dbeeff 100%)",
          }}
        >
          <p className="text-center text-sm font-bold text-gray-600 mb-3">
            Today's Overview
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Amount of receipt:</p>
              <p className="text-3xl font-black text-gray-800">
                ₹{todayTotal.toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              data-ocid="sell_rp.record.button"
              onClick={() => navigate("sell-rp-record")}
              className="px-4 py-2 rounded-xl border-2 text-sm font-bold"
              style={{ borderColor: "#008080", color: "#008080" }}
            >
              Record
            </button>
          </div>
        </div>

        {/* Wallet Information */}
        <div>
          <h3 className="text-sm font-black text-gray-700 mb-3 px-1">
            Wallet Information
          </h3>

          {upiWallets.length === 0 ? (
            <div
              className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-10 gap-2"
              data-ocid="sell_rp.wallets.empty_state"
            >
              <div className="text-5xl">📦</div>
              <p className="text-sm text-gray-400">
                There is currently no data
              </p>
            </div>
          ) : (
            <div className="space-y-3" data-ocid="sell_rp.wallets.list">
              {upiWallets.map((wallet, idx) => (
                <div
                  key={wallet.id}
                  data-ocid={`sell_rp.wallet.item.${idx + 1}`}
                  className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={WALLET_LOGOS[wallet.name]}
                      alt={wallet.name}
                      className="w-10 h-10 object-cover rounded-xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">
                      {wallet.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {wallet.upiId}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-ocid={`sell_rp.wallet.delete_button.${idx + 1}`}
                    onClick={() => handleDeleteWallet(wallet.id)}
                    className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Wallet Button */}
        <button
          type="button"
          data-ocid="sell_rp.add_wallet.button"
          onClick={() => setShowAddWallet(true)}
          className="w-full bg-white rounded-2xl shadow-sm px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#008080" }}
          >
            <Plus size={20} className="text-white" />
          </div>
          <span className="font-bold text-gray-700">Add Wallet</span>
        </button>
      </main>

      <BottomNav active="sell-rp" onNavigate={navigate} />

      {/* Add Wallet Modal */}
      {showAddWallet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          data-ocid="sell_rp.add_wallet.modal"
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowAddWallet(false);
              setAddError("");
            }}
          />
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 bg-white w-full max-w-[430px] rounded-t-3xl p-5 pb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-800">
                Add UPI Wallet
              </h3>
              <button
                type="button"
                data-ocid="sell_rp.add_wallet.close_button"
                onClick={() => {
                  setShowAddWallet(false);
                  setAddError("");
                }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {walletTypes.map((wt) => (
                <button
                  key={wt}
                  type="button"
                  data-ocid={`sell_rp.wallet_type.${wt.toLowerCase()}.button`}
                  onClick={() => setSelectedWalletType(wt)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 transition-all ${
                    selectedWalletType === wt
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={WALLET_LOGOS[wt]}
                      alt={wt}
                      className="w-8 h-8 object-cover rounded-lg"
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{wt}</span>
                </button>
              ))}
            </div>

            <div className="mb-1">
              <label
                htmlFor="upi-id-input"
                className="text-xs font-bold text-gray-600 mb-1 block"
              >
                UPI ID
              </label>
              <input
                type="text"
                id="upi-id-input"
                data-ocid="sell_rp.upi_id.input"
                placeholder={
                  selectedWalletType
                    ? `yourname@${selectedWalletType.toLowerCase()}`
                    : "yourname@upi"
                }
                value={upiInput}
                onChange={(e) => {
                  setUpiInput(e.target.value);
                  setAddError("");
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 transition-colors"
              />
            </div>

            {addError && (
              <p className="text-xs text-red-500 mb-3">{addError}</p>
            )}

            <button
              type="button"
              data-ocid="sell_rp.add_wallet.submit_button"
              onClick={handleAddWallet}
              className="w-full py-3 rounded-xl font-black text-white mt-4"
              style={{ backgroundColor: "#008080" }}
            >
              Add Wallet
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function TeamManagementScreen({
  inviteCode,
  navigate,
}: {
  inviteCode: string;
  navigate: (s: Screen) => void;
}) {
  const [linkCopied, setLinkCopied] = useState(false);
  const inviteLink = `https://wynpay-wxx.caffeine.xyz/?inviteCode=${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast.success("Invite link copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-100"
    >
      {/* Header */}
      <div className="px-4 pt-10 pb-4 bg-white shadow-sm flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("mine")}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          data-ocid="team.back.button"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-800 text-lg">Team management</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 space-y-3 pt-3 px-3">
        {/* Yesterday's Rebates - Blue Card */}
        <div className="bg-blue-600 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white font-bold text-base mb-3">
                Yesterday's Rebates
              </p>
              <div className="flex gap-8">
                <div>
                  <p className="text-blue-200 text-xs">Top Up</p>
                  <p className="text-white font-bold text-lg">0.0</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs flex items-center gap-1">
                    Purchase <Lock size={12} className="text-blue-300" />
                  </p>
                  <p className="text-white font-bold text-lg">0.0</p>
                </div>
              </div>
            </div>
            {/* Calendar widget */}
            <div className="bg-white rounded-xl p-3 text-center shadow-md min-w-[90px]">
              <div className="flex justify-center gap-3 mb-1">
                <div className="w-1 h-4 bg-orange-400 rounded-full" />
                <div className="w-1 h-4 bg-orange-400 rounded-full" />
              </div>
              <p className="text-gray-500 text-xs">Team Members</p>
              <p className="text-gray-800 font-black text-2xl">3</p>
            </div>
          </div>
        </div>

        {/* Today's Rebates */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-800 text-base mb-3">
            Today's Rebates
          </p>
          <div className="flex gap-8">
            <div>
              <p className="text-gray-500 text-xs">Top Up</p>
              <p className="text-gray-800 font-bold text-base">0.0</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Purchase</p>
              <p className="text-gray-800 font-bold text-base">0.0</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Team Additions</p>
              <p className="text-gray-800 font-bold text-base">0</p>
            </div>
          </div>
        </div>

        {/* Invite Link */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-800 text-base mb-3">Invite Link</p>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5 border border-gray-200">
            <span className="flex-1 text-xs text-gray-600 truncate">
              {inviteLink}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              {linkCopied ? (
                <span className="text-[11px] text-green-600 font-bold">✓</span>
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </div>

        {/* More ways */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-800 text-base mb-4">More ways</p>
          <div className="flex justify-around">
            {/* Telegram */}
            <button
              type="button"
              onClick={() =>
                window.open("https://t.me/wynpayofficls", "_blank")
              }
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-[#29b5e8] flex items-center justify-center shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-7 h-7"
                  role="img"
                  aria-label="Telegram"
                >
                  <title>Telegram</title>
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.83.94z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500">Telegram</span>
            </button>
            {/* Facebook */}
            <button
              type="button"
              onClick={() => window.open("https://facebook.com", "_blank")}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-[#1877f2] flex items-center justify-center shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-7 h-7"
                  role="img"
                  aria-label="Facebook"
                >
                  <title>Facebook</title>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500">FaceBook</span>
            </button>
            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => window.open("https://whatsapp.com", "_blank")}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-[#25d366] flex items-center justify-center shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-7 h-7"
                  role="img"
                  aria-label="WhatsApp"
                >
                  <title>WhatsApp</title>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500">WhatsApp</span>
            </button>
            {/* QR Code */}
            <button
              type="button"
              onClick={() => toast.info("QR Code feature coming soon!")}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-[#3b5998] flex items-center justify-center shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-6 h-6"
                  role="img"
                  aria-label="QR Code"
                >
                  <title>QR Code</title>
                  <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h1v1h-1v-1zm-5 0h1v1h-1v-1zm2 2h1v1h-1v-1zm2 0h1v1h-1v-1zm-4 2h1v1h-1v-1zm2 0h1v1h-1v-1zm2 0h1v1h-1v-1zm0 2h1v1h-1v-1zm-4 0h1v1h-1v-1z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500">QR code</span>
            </button>
            {/* Share */}
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({ url: inviteLink, title: "Join WynPay" })
                    .catch(() => {});
                } else {
                  handleCopyLink();
                }
              }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-[#e53e3e] flex items-center justify-center shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-6 h-6"
                  role="img"
                  aria-label="Share"
                >
                  <title>Share</title>
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500">Share</span>
            </button>
          </div>
        </div>

        {/* Purchase Reward Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <p className="font-bold text-gray-800 text-base">Purchase Reward</p>
            <button
              type="button"
              className="text-xs text-gray-400 flex items-center gap-0.5"
            >
              Detail <ChevronRight size={13} />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal-500 text-white">
                <th className="py-2.5 px-4 text-center font-semibold">Type</th>
                <th className="py-2.5 px-4 text-center font-semibold">
                  Profit‰
                </th>
                <th className="py-2.5 px-4 text-center font-semibold">Scale</th>
                <th className="py-2.5 px-4 text-center font-semibold">DAU</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 1, profit: "3.0", scale: 2, dau: 0 },
                { type: 2, profit: "2.0", scale: 1, dau: 0 },
                { type: 3, profit: "1.0", scale: 0, dau: 0 },
              ].map((row, i) => (
                <tr
                  key={row.type}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-3 px-4 text-center text-gray-700">
                    {row.type}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {row.profit}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {row.scale}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {row.dau}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Up Reward Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <p className="font-bold text-gray-800 text-base">Top Up Reward</p>
            <button
              type="button"
              className="text-xs text-gray-400 flex items-center gap-0.5"
            >
              Detail <ChevronRight size={13} />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal-500 text-white">
                <th className="py-2.5 px-4 text-center font-semibold">Type</th>
                <th className="py-2.5 px-4 text-center font-semibold">
                  Profit‰
                </th>
                <th className="py-2.5 px-4 text-center font-semibold">Scale</th>
                <th className="py-2.5 px-4 text-center font-semibold">DAU</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 1, profit: "3.0", scale: 1, dau: 0 },
                { type: 2, profit: "2.0", scale: 0, dau: 0 },
                { type: 3, profit: "1.0", scale: 0, dau: 0 },
              ].map((row, i) => (
                <tr
                  key={row.type}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-3 px-4 text-center text-gray-700">
                    {row.type}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {row.profit}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {row.scale}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {row.dau}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Mine / Profile Screen ────────────────────────────────────────────────────
function MineScreen({
  buyAmount,
  rpCoins,
  userPhone,
  inviteCode,
  navigate,
  onLogout,
}: {
  buyAmount: number;
  rpCoins: number;
  userPhone: string;
  inviteCode: string;
  navigate: (s: Screen) => void;
  onLogout: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const currentBalance = buyAmount + rpCoins;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Invite code copied!");
  };

  const menuItems: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }[] = [
    {
      icon: <Gift size={18} className="text-amber-500" />,
      label: "Newbie Rewards",
      onClick: () => navigate("newcomer-bonus"),
    },
    {
      icon: <Grid2x2 size={18} className="text-teal-600" />,
      label: "Bind Payment App",
    },
    {
      icon: <HelpCircle size={18} className="text-blue-500" />,
      label: "Common Problem",
    },
    {
      icon: <Headphones size={18} className="text-purple-500" />,
      label: "Online Service",
      onClick: () => window.open("https://t.me/wynpayservice", "_blank"),
    },
    {
      icon: <Lock size={18} className="text-gray-500" />,
      label: "Account Security",
    },
    {
      icon: <Send size={18} className="text-teal-500" />,
      label: "Official Channel",
      onClick: () => window.open("https://t.me/wynpayofficls", "_blank"),
    },
    {
      icon: <Users size={18} className="text-amber-600" />,
      label: "Superior Relationship",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-100"
      data-ocid="mine.page"
    >
      {/* Header */}
      <header className="px-4 pt-10 pb-5 bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-teal-500 flex items-center justify-center border-2 border-amber-400/50 shadow-lg">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium tracking-wide mb-0.5">
              MOBILE
            </p>
            <p className="text-white font-bold text-base">
              +91{" "}
              {userPhone
                ? userPhone.replace(/^(\d{5})(\d{5})$/, "$1 $2")
                : "XXXXXXXXXX"}
            </p>
            {/* Invite Code */}
            <div className="mt-2 flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-1.5 w-fit border border-amber-400/20">
              <span className="text-xs text-gray-400">Invite:</span>
              <span className="text-amber-400 font-bold text-sm tracking-widest">
                {inviteCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                data-ocid="mine.copy.button"
                className="ml-1 text-teal-400 hover:text-teal-300 transition-colors"
              >
                {copied ? (
                  <span className="text-[10px] text-green-400 font-bold">
                    ✓
                  </span>
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 space-y-3 pt-3 px-3">
        {/* Current Balance Card */}
        <div
          className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
          data-ocid="mine.balance.card"
        >
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">
              Current Balance
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-800">
                ₹{currentBalance.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-3 mt-1.5">
              <span className="text-[11px] text-gray-400">
                Buy:{" "}
                <span className="text-amber-600 font-semibold">
                  ₹{buyAmount.toFixed(0)}
                </span>
              </span>
              <span className="text-[11px] text-gray-400">
                Rewards:{" "}
                <span className="text-teal-600 font-semibold">
                  ₹{rpCoins.toFixed(0)}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
              <Wallet size={18} className="text-white" />
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>

        {/* My Team Card */}
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          data-ocid="mine.team.card"
        >
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-black text-lg leading-tight">
                My team
              </p>
              <p className="text-teal-200 text-xs mt-0.5">
                3-LEVEL rebate mechanism
              </p>
              <button
                type="button"
                onClick={() => navigate("team-management")}
                data-ocid="mine.team.button"
                className="mt-2 text-amber-300 text-xs font-bold flex items-center gap-0.5 hover:text-amber-200 transition-colors"
              >
                View earnings <ChevronRight size={13} />
              </button>
            </div>
            <div className="w-16 h-16 rounded-full bg-teal-500/30 flex items-center justify-center">
              <Users size={30} className="text-amber-300" />
            </div>
          </div>
        </div>

        {/* Menu List Card */}
        <div
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          data-ocid="mine.menu.card"
        >
          {menuItems.map((item, idx) => (
            <div key={item.label}>
              <button
                type="button"
                onClick={item.onClick}
                data-ocid={`mine.menu.item.${idx + 1}`}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <span className="flex-1 text-left text-sm font-medium text-gray-700">
                  {item.label}
                </span>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
              {idx < menuItems.length - 1 && (
                <div className="ml-14 border-b border-gray-100" />
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          data-ocid="mine.logout.button"
          className="w-full py-3.5 rounded-2xl border-2 border-red-400 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2 bg-white shadow-sm"
        >
          <LogOut size={16} />
          Log Out
        </button>

        {/* Footer */}
        <div className="text-center py-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>

      <BottomNav active="mine" onNavigate={navigate} />
    </motion.div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forgotOtpInput, setForgotOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [userName, setUserName] = useState("Alex Johnson");
  const [registeredUsers, setRegisteredUsers] = useState<UserStore>(() => {
    try {
      return JSON.parse(localStorage.getItem("wynpay_users") || "{}");
    } catch {
      return {};
    }
  });

  const saveUser = (phone: string, user: RegisteredUser) => {
    const updated = { ...registeredUsers, [phone.replace(/\D/g, "")]: user };
    setRegisteredUsers(updated);
    localStorage.setItem("wynpay_users", JSON.stringify(updated));
  };

  const [buyQuantity, setBuyQuantity] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);
  const [rpCoins, setRpCoins] = useState(0);
  const sellAmount = buyAmount + rpCoins;
  const [totalRevenue] = useState(0);
  const [upiWallets, setUpiWallets] = useState<UpiWallet[]>([]);
  const [sellTransactions, _setSellTransactions] = useState<SellTransaction[]>(
    [],
  );

  const navigate = useCallback((s: Screen) => {
    setErrors({});
    setScreen(s);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.22 0.025 250)",
            border: "1px solid oklch(0.72 0.14 75 / 0.3)",
            color: "oklch(0.95 0.01 250)",
          },
        }}
      />

      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <SplashScreen key="splash" navigate={navigate} />
        )}
        {screen === "login-phone" && (
          <LoginScreen
            key="login-phone"
            phone={phone}
            setPhone={setPhone}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
            registeredUsers={registeredUsers}
            setUserName={setUserName}
          />
        )}
        {screen === "signup" && (
          <SignupScreen
            key="signup"
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
            setUserName={setUserName}
            saveUser={saveUser}
            registeredUsers={registeredUsers}
          />
        )}
        {screen === "forgot-phone" && (
          <ForgotPhoneScreen
            key="forgot-phone"
            phone={phone}
            setPhone={setPhone}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
            setGeneratedOtp={setGeneratedOtp}
            setForgotPhone={setForgotPhone}
          />
        )}
        {screen === "forgot-otp" && (
          <ForgotOtpScreen
            key="forgot-otp"
            phone={forgotPhone}
            otpInput={forgotOtpInput}
            setOtpInput={setForgotOtpInput}
            generatedOtp={generatedOtp}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
            onResend={() => {
              const otp = Math.floor(
                100000 + Math.random() * 900000,
              ).toString();
              setGeneratedOtp(otp);
              toast.success(
                `SMS resent to ${forgotPhone}: Your code is ${otp}`,
              );
            }}
          />
        )}
        {screen === "forgot-password" && (
          <ForgotPasswordScreen
            key="forgot-password"
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
            forgotPhone={forgotPhone}
            registeredUsers={registeredUsers}
            saveUser={saveUser}
          />
        )}
        {screen === "home" && (
          <HomeScreen
            key="home"
            userName={userName}
            buyQuantity={buyQuantity}
            buyAmount={buyAmount}
            sellAmount={sellAmount}
            totalRevenue={totalRevenue}
            navigate={navigate}
          />
        )}
        {screen === "rewards" && (
          <RewardsScreen key="rewards" rpCoins={rpCoins} navigate={navigate} />
        )}
        {screen === "newcomer-bonus" && (
          <NewcomerBonusScreen
            key="newcomer-bonus"
            buyQuantity={buyQuantity}
            buyAmount={buyAmount}
            navigate={navigate}
          />
        )}
        {screen === "buy-rp" && (
          <BuyRPScreen
            key="buy-rp"
            navigate={navigate}
            setBuyQuantity={setBuyQuantity}
            setBuyAmount={setBuyAmount}
            setRpCoins={setRpCoins}
          />
        )}
        {screen === "sell-rp" && (
          <SellRPScreen
            key="sell-rp"
            navigate={navigate}
            upiWallets={upiWallets}
            setUpiWallets={setUpiWallets}
            sellTransactions={sellTransactions}
          />
        )}
        {screen === "mine" && (
          <MineScreen
            key="mine"
            buyAmount={buyAmount}
            rpCoins={rpCoins}
            userPhone={phone}
            inviteCode={
              registeredUsers[phone.replace(/\D/g, "")]?.inviteCode ||
              `WYN${phone.slice(-4)}`
            }
            navigate={navigate}
            onLogout={() => navigate("splash")}
          />
        )}
        {screen === "buy-rp-record" && (
          <BuyRPRecordScreen key="buy-rp-record" navigate={navigate} />
        )}
        {screen === "sell-rp-record" && (
          <SellRPRecordScreen
            key="sell-rp-record"
            navigate={navigate}
            currentBalance={buyAmount + rpCoins}
          />
        )}
        {screen === "team-management" && (
          <TeamManagementScreen
            key="team-management"
            inviteCode={
              registeredUsers[phone.replace(/\D/g, "")]?.inviteCode ||
              `WYN${phone.slice(-4)}`
            }
            navigate={navigate}
          />
        )}
      </AnimatePresence>

      {screen === "splash" && (
        <footer className="fixed bottom-4 left-0 right-0 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      )}
    </div>
  );
}
