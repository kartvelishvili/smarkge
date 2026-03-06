import {
  Activity, ArrowLeft, ArrowRight, BarChart, BarChart3, Box, Briefcase, Building2, 
  CheckCircle, CheckCircle2, ChevronLeft, ChevronRight, Code, Code2, Cpu, Database, 
  ExternalLink, Facebook, Factory, Globe, GraduationCap, Grid, HeartHandshake, 
  HeartPulse, HelpCircle, Image, Instagram, Layers, Layout, Linkedin, Loader2, 
  Monitor, MoreHorizontal, MoveDiagonal, MoveHorizontal, Music2, Orbit, PenTool, 
  Plane, Plus, Quote, Save, Search, Share2, Shield, ShoppingBag, ShoppingCart, 
  Smartphone, Sparkles, Stethoscope, Target, Trash2, TrendingUp, Truck, Users, 
  X, Youtube, Zap, ZoomIn
} from 'lucide-react';

export const iconMap = {
  Activity, ArrowLeft, ArrowRight, BarChart, BarChart3, Box, Briefcase, Building2, 
  CheckCircle, CheckCircle2, ChevronLeft, ChevronRight, Code, Code2, Cpu, Database, 
  ExternalLink, Facebook, Factory, Globe, GraduationCap, Grid, HeartHandshake, 
  HeartPulse, HelpCircle, Image, Instagram, Layers, Layout, Linkedin, Loader2, 
  Monitor, MoreHorizontal, MoveDiagonal, MoveHorizontal, Music2, Orbit, PenTool, 
  Plane, Plus, Quote, Save, Search, Share2, Shield, ShoppingBag, ShoppingCart, 
  Smartphone, Sparkles, Stethoscope, Target, Trash2, TrendingUp, Truck, Users, 
  X, Youtube, Zap, ZoomIn
};

export const resolveIcon = (name) => {
  if (!name) return HelpCircle;
  return iconMap[name] || HelpCircle;
};