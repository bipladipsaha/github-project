"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, Loader2, GitCommit, FileText, ArrowRight, AlertCircle } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import SmartPreservation from "./SmartPreservation";

const GithubIcon = ({ className, size = 24 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import * as diff from "diff";

export default function DeploymentModal({ isOpen, onClose, generatedReadme, assets, workflows }) {
  const { data: session } = useSession();
  const [step, setStep] = useState("auth"); // auth, analyze, diff, deploy, success, error
  const [analysis, setAnalysis] = useState(null);
  const [selectedWidgets, setSelectedWidgets] = useState([]);
  const [deployLogs, setDeployLogs] = useState([]);
  const [finalReadme, setFinalReadme] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    async function analyzeRepository() {
      setDeployLogs(["Fetching repository data..."]);
      try {
        const res = await fetch("/api/github/analyze");
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to analyze repo");

        setAnalysis(data);
        if (data.widgets && data.widgets.length > 0) {
          setSelectedWidgets(data.widgets.map(w => w.id)); // Select all by default
        }
        setStep("diff");
        setFinalReadme(generatedReadme); // We will merge in a real app based on widgets
      } catch (err) {
        setErrorMsg(err.message);
        setStep("error");
      }
    }

    if (isOpen) {
      if (session) {
        setStep("analyze");
        analyzeRepository();
      } else {
        setStep("auth");
      }
    }
  }, [isOpen, session, generatedReadme]);

  const executeDeploy = async () => {
    setStep("deploy");
    setDeployLogs(prev => [...prev, "Preparing deployment..."]);
    
    // In a full implementation, this is where we would merge `selectedWidgets` from `analysis.content` into `finalReadme`.
    // For now, we'll append preserved widgets if they were selected for demonstration.
    let mergedReadme = generatedReadme;
    if (analysis && analysis.widgets) {
        const preserved = analysis.widgets.filter(w => selectedWidgets.includes(w.id));
        if (preserved.length > 0) {
            mergedReadme += `\n\n<!-- Preserved Sections -->\n`;
            // Simple logic: If we find the snippet in the old readme, keep it. 
            // A robust version would use AST or regex boundaries.
            preserved.forEach(w => {
                mergedReadme += `\n<!-- Preserved: ${w.name} -->\n[${w.name} Preserved]`; 
            });
        }
    }

    try {
      setDeployLogs(prev => [...prev, "Checking Repository...", "Uploading Assets..."]);
      const res = await fetch("/api/github/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          readmeContent: mergedReadme,
          assets: assets,
          workflows: workflows,
          currentSha: analysis?.sha
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deployment failed");

      setDeployLogs(prev => [...prev, "Updating README...", "Committing...", "Done!"]);
      setTimeout(() => {
        setSuccessData(data);
        setStep("success");
      }, 1000);

    } catch (err) {
      setErrorMsg(err.message);
      setStep("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <GithubIcon className="text-white" size={24} />
            Deploy to GitHub
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {step === "auth" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <GithubIcon className="text-blue-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign in to Deploy</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                We need permission to create or update the <code>&lt;username&gt;/&lt;username&gt;</code> repository on your profile.
              </p>
              <button 
                onClick={() => signIn('github')}
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto"
              >
                <GithubIcon size={20} />
                Connect GitHub Account
              </button>
            </div>
          )}

          {step === "analyze" && (
            <div className="text-center py-12 flex flex-col items-center">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
              <h3 className="text-lg font-medium">Analyzing Repository...</h3>
              <p className="text-gray-400 text-sm mt-2">{deployLogs[deployLogs.length - 1]}</p>
            </div>
          )}

          {step === "diff" && (
            <div className="space-y-6">
              <SmartPreservation 
                widgets={analysis?.widgets} 
                selectedWidgets={selectedWidgets}
                setSelectedWidgets={setSelectedWidgets}
              />

              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <FileText size={18} />
                  Pending Changes
                </h4>
                <div className="text-sm text-gray-400">
                  <div className="flex items-center gap-2 mb-2 text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Update README.md
                  </div>
                  {assets.map((asset, i) => (
                    <div key={`asset-${i}`} className="flex items-center gap-2 text-blue-400 ml-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      Add assets/{asset.filename}
                    </div>
                  ))}
                  {workflows?.map((wf, i) => (
                    <div key={`wf-${i}`} className="flex items-center gap-2 text-yellow-400 ml-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                      Add {wf.path}
                    </div>
                  ))}
                  {analysis?.sha && (
                    <div className="flex items-center gap-2 mt-2 text-purple-400">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      Backup existing README.md to README.backup.md
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={executeDeploy}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center gap-2"
                >
                  Confirm & Deploy
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === "deploy" && (
            <div className="py-8">
              <div className="max-w-sm mx-auto">
                <h3 className="text-xl font-semibold mb-6 text-center">Deploying to GitHub</h3>
                <div className="space-y-4">
                  {deployLogs.map((log, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      {index === deployLogs.length - 1 ? (
                        <Loader2 size={16} className="text-blue-500 animate-spin" />
                      ) : (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                      <span className={index === deployLogs.length - 1 ? "text-white" : "text-gray-400"}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">🎉 Profile Updated!</h3>
              <p className="text-gray-400 mb-6">Your new premium GitHub profile is now live.</p>
              
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5 text-left mb-6 mx-auto">
                <h4 className="text-blue-400 font-bold flex items-center gap-2 mb-2">
                  <AlertCircle size={18} />
                  Important Next Step!
                </h4>
                <p className="text-gray-300 text-sm mb-4">
                  GitHub requires you to manually choose to display this repository on your profile. When you visit your repository, look for the <strong>Share to Profile</strong> button in the right sidebar.
                </p>
                <div className="rounded-lg overflow-hidden border border-gray-700/50 mb-2">
                  <img src="/share-to-profile.png" alt="Share to Profile Button" className="w-full object-cover object-right" />
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <a 
                  href={successData?.commitUrl?.replace(/\/commit\/.*/, '')}
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Go to Repository
                </a>
                <button 
                  onClick={onClose}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Deployment Failed</h3>
              <p className="text-red-400 mb-6 max-w-md mx-auto">{errorMsg}</p>
              <button 
                onClick={() => setStep("auth")}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
