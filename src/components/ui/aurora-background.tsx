import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const AuroraBackground = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className={cn("relative w-full min-h-screen overflow-hidden", className)}>
      {/* Background Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-black"
      >
        <div className="aurora-container">
          <div className="aurora-1"></div>
          <div className="aurora-2"></div>
          <div className="aurora-3"></div>
          <div className="aurora-4"></div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
