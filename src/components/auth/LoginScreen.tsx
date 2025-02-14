import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LockIcon, UnlockIcon } from "lucide-react";
import { motion } from "framer-motion";

interface LoginScreenProps {
  onLogin?: (password: string) => void;
  isLoading?: boolean;
  error?: string;
}

const LoginScreen = ({
  onLogin = () => {},
  isLoading = false,
  error = "",
}: LoginScreenProps) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-orange-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white shadow-xl border-orange-200">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-orange-600">
              Festa Junina pdv
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Welcome! Please enter the system password to continue.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  autoFocus
                />
                {password ? (
                  <UnlockIcon className="absolute right-3 top-2.5 h-5 w-5 text-orange-500" />
                ) : (
                  <LockIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                )}
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm"
                >
                  {error}
                </motion.p>
              )}
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={!password || isLoading}
              >
                {isLoading ? "Authenticating..." : "Login"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">Authorized personnel only</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
