import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "./FormSection";

// Available categories
const degreeLevels = [
  "Bachelor",
  "Master",
  "PhD",
  "Certificate",
  "Diploma",
  "Language Course",
];

// University categories
const categories = [
  "Comprehensive University",
  "Engineering University",
  "Medical University",
  "Business School",
  "Art Academy",
  "Language School", 
  "Other"
];

interface BasicInfoSectionProps {
  title: string;
  setTitle: (value: string) => void;
  universityName: string;
  setUniversityName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  degreeLevel: string;
  setDegreeLevel: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  durationInYears: number;
  setDurationInYears: (value: number) => void;
}

export function BasicInfoSection({
  title,
  setTitle,
  universityName,
  setUniversityName,
  description,
  setDescription,
  location,
  setLocation,
  degreeLevel,
  setDegreeLevel,
  category,
  setCategory,
  durationInYears,
  setDurationInYears,
}: BasicInfoSectionProps) {
  return (
    <FormSection title="Basic Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Offer Title <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., Computer Science Bachelor's at Fudan University"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="universityName" className="text-sm font-medium">
            University Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="universityName"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            placeholder="E.g., Fudan University"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide details about the program, university, and opportunities for students"
          className="min-h-[120px]"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location <span className="text-destructive">*</span>
          </label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="E.g., Shanghai, China"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="degreeLevel" className="text-sm font-medium">
            Degree Level <span className="text-destructive">*</span>
          </label>
          <Select value={degreeLevel} onValueChange={setDegreeLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select degree level" />
            </SelectTrigger>
            <SelectContent>
              {degreeLevels.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            University Category <span className="text-destructive">*</span>
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select university category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="durationInYears" className="text-sm font-medium">
            Duration (Years) <span className="text-destructive">*</span>
          </label>
          <Input
            id="durationInYears"
            type="number"
            min="0.5"
            step="0.5"
            value={durationInYears}
            onChange={(e) => setDurationInYears(parseFloat(e.target.value))}
            required
          />
        </div>
      </div>
    </FormSection>
  );
} 