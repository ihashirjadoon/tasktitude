"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import Navbar from './Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-10">
        <div className="max-w-3xl text-center">
          <motion.h1 
            className="text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Pathway to productivity
          </motion.h1>
          <motion.p 
            className="text-xl mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Celebrate the joy of accomplishment with an app designed to track your progress, 
            motivate your efforts, and celebrate your successes.
          </motion.p>
          <motion.div 
            className="space-x-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button size="lg">Get for free</Button>
            <Button variant="outline" size="lg">
              Learn more →
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;