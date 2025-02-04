"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { LucideUser, ChevronDown, ChevronUp } from 'lucide-react';
import Papa from 'papaparse';
import { Barlow } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';

