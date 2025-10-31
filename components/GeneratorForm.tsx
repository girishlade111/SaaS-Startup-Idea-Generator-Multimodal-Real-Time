import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import type { FormState } from '../types';
import { SparklesIcon, VideoIcon, ImageIcon, RefreshCwIcon, BrainCircuitIcon, MicrophoneIcon } from './IconComponents';

interface GeneratorFormProps {
  onSubmit: (formData: FormState) => void;
  isLoading: boolean;
  isGenerated: boolean;
  onReset: () => void;
}

const InputField: React.FC<{ 
  label: string; 
  placeholder: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  isRequired?: boolean;
  hasError?: boolean;
}> = ({ label, placeholder, value, onChange, isRequired = false, hasError = false }) => (
  <div>
    <label className="block text-sm font-medium text-neutral-300 mb-1.5">{label}{isRequired && <span className="text-red-400 ml-1">*</span>}</label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={isRequired}
      className={`w-full bg-neutral-900 border rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:ring-2 outline-none transition-all ${hasError ? 'border-red-500/60 ring-red-500/30' : 'border-neutral-700 focus:ring-brand focus:border-brand'}`}
    />
  </div>
);

const FileInput: React.FC<{ id: string; label: string; file: File | null; setFile: (file: File | null) => void; accept: string; icon: React.ReactNode }> = ({ id, label, file, setFile, accept, icon }) => (
  <div>
    <label htmlFor={id} className="cursor-pointer block bg-neutral-900 border border-neutral-700 rounded-lg p-4 text-center hover:border-brand/70 transition-colors">
      {icon}
      <span className="mt-2 block text-sm font-semibold text-neutral-300">{label}</span>
      <span className="mt-1 block text-xs text-neutral-500 truncate">{file ? file.name : 'Click to upload'}</span>
      <input id={id} type="file" className="hidden" accept={accept} onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
    </label>
  </div>
);

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onSubmit, isLoading, isGenerated, onReset }) => {
  const [textInput, setTextInput] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [errors, setErrors] = useState<{ searchQuery?: string }>({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // FIX: Cast window to `any` to access experimental SpeechRecognition APIs without TypeScript errors.
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTextInput(prev => (prev.trim() ? prev.trim() + ' ' : '') + finalTranscript.trim());
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };


  const validateForm = () => {
    const newErrors: { searchQuery?: string } = {};
    if (!searchQuery.trim()) {
      newErrors.searchQuery = 'Web Search Query is required to validate ideas.';
    } else if (searchQuery.trim().length < 5) {
      newErrors.searchQuery = 'Please enter a more descriptive query (min. 5 characters).';
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onSubmit({ textInput, videoFile, imageFile, industry, targetAudience, searchQuery, thinkingMode });
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-6 h-full shadow-lg">
      <h3 className="text-xl font-bold text-neutral-100">Idea Inputs</h3>
      <p className="text-sm text-neutral-400 mt-1">Provide context for the AI engine.</p>
      
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="text-input" className="block text-sm font-medium text-neutral-300 mb-1.5">Text Input</label>
          <div className="relative">
            <textarea
              id="text-input"
              rows={4}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Describe a problem, a pain point, or a core idea..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all pr-10"
            ></textarea>
            {isSpeechRecognitionSupported && (
              <button
                type="button"
                onClick={handleToggleListening}
                className={`absolute top-2.5 right-2.5 p-1 rounded-full transition-colors ${isListening ? 'text-brand animate-pulse' : 'text-neutral-400 hover:text-neutral-100'}`}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FileInput id="video-upload" label="Upload Video" file={videoFile} setFile={setVideoFile} accept="video/*" icon={<VideoIcon className="w-6 h-6 mx-auto text-neutral-500" />} />
          <FileInput id="image-upload" label="Upload Image" file={imageFile} setFile={setImageFile} accept="image/*" icon={<ImageIcon className="w-6 h-6 mx-auto text-neutral-500" />} />
        </div>
        
        <InputField label="Industry" placeholder="e.g., E-commerce, DevOps" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        <InputField label="Target Audience" placeholder="e.g., Small businesses" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
        
        <div>
          <InputField 
            label="Web Search Query" 
            placeholder="e.g., 'latest trends in devtools'" 
            value={searchQuery} 
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (errors.searchQuery) {
                setErrors(prev => ({ ...prev, searchQuery: undefined }));
              }
            }} 
            isRequired={true}
            hasError={!!errors.searchQuery}
          />
          {errors.searchQuery && <p className="text-red-400 text-xs mt-1.5 px-1">{errors.searchQuery}</p>}
        </div>
        
        <div className="pt-2">
            <label htmlFor="thinking-mode-toggle" className="flex items-center justify-between cursor-pointer bg-neutral-900 border border-neutral-700 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <BrainCircuitIcon className="w-5 h-5 text-brand-light" />
                  <div>
                    <span className="font-semibold text-neutral-200 text-sm">Thinking Mode</span>
                    <p className="text-xs text-neutral-400">Deeper analysis for complex ideas. (Slower)</p>
                  </div>
                </div>
                <div className="relative">
                    <input 
                        type="checkbox" 
                        id="thinking-mode-toggle" 
                        className="sr-only" 
                        checked={thinkingMode}
                        onChange={() => setThinkingMode(!thinkingMode)}
                    />
                    <div className="block bg-neutral-700 w-12 h-6 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${thinkingMode ? 'transform translate-x-6 bg-brand-light' : ''}`}></div>
                </div>
            </label>
        </div>


        <div className="pt-2">
          {isGenerated ? (
             <button
                type="button"
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 bg-neutral-700 text-neutral-100 font-semibold py-3 px-4 rounded-lg hover:bg-neutral-600 transition-colors"
              >
                <RefreshCwIcon className="w-4 h-4" />
                Start Over
              </button>
          ) : (
             <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-brand/80 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Generate Ideas
                  </>
                )}
              </button>
          )}
        </div>
      </form>
    </div>
  );
};