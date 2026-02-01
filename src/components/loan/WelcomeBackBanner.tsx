import { motion } from 'framer-motion';
import { UserCheck } from 'lucide-react';

interface WelcomeBackBannerProps {
  borrowerId: string;
}

export function WelcomeBackBanner({ borrowerId }: WelcomeBackBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary/10 border-b border-primary/20"
    >
      <div className="container max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground text-sm">Welcome Back!</p>
            <p className="text-xs text-muted-foreground">
              ID: <span className="font-mono">{borrowerId}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
