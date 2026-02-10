import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: 'primary' | 'secondary' | 'accent' | 'warning';
}

const colorStyles = {
  primary: 'from-primary/20 to-primary/5 text-primary border-primary/20',
  secondary: 'from-secondary/20 to-secondary/5 text-secondary border-secondary/20',
  accent: 'from-accent/20 to-accent/5 text-accent border-accent/20',
  warning: 'from-yellow-500/20 to-yellow-500/5 text-yellow-500 border-yellow-500/20',
};

export function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-gradient-to-br ${colorStyles[color]} rounded-lg border p-6 shadow-xl`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          {trend && (
            <p className="text-xs text-muted-foreground mt-2">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorStyles[color].split(' ')[0]} ${colorStyles[color].split(' ')[1]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
