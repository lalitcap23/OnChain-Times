"use client";
import { useState } from "react";
import Verify from "@/actions/verify";
import SubNews from "@/actions/submit";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Newspaper, Link, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

export default function PostNews() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleVerification = async () => {
    setError("");
    setSuccess(false);

    if (!title.trim() || !description.trim() || !source.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const result = await Verify(title, description, source);
      console.log(result);

      if (result === null) {
        setError("Verification failed. Please try again.");
        return;
      }

      const constructedJson = {
        title: title,
        description: description,
        source: source,
        confidence_score: Math.round(result.confidence_score * 100),
        isVerified: result.isVerified,
        matching_details: result.matching_details,
        discrepancies: result.discrepancies,
      };

      setScore(constructedJson.confidence_score);
      if (constructedJson.confidence_score >= 70) {
        setSuccess(true);
      }
    } catch (err) {
      setError("Error during verification");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmission = async () => {
    if (!score || score < 70) {
      setError("Please verify first.");
      return;
    }

    setLoading(true);
    try {
      const submissionId = await SubNews(title, description, score);
      setId(submissionId);
      setError("");
      setSuccess(true);
      // Reset form
      setTitle("");
      setDescription("");
      setSource("");
      setScore(null);
    } catch (err) {
      setError("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground>
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block p-3 rounded-full bg-violet-600/20 mb-4"
              >
                <Newspaper className="w-8 h-8 text-violet-400" />
              </motion.div>
              <h1 className="text-4xl font-bold text-white mb-4">Submit News</h1>
              <p className="text-gray-400">Share verified news with the community</p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  placeholder="Enter news title"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Description</label>
                <textarea
                  placeholder="Enter news description"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors h-32"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Source URL</label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://example.com/news"
                    className="w-full px-4 py-3 pl-10 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                  <Link className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              {score !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-4 ${
                    score >= 70 ? "text-green-400" : "text-yellow-400"
                  } bg-gray-800/50 p-4 rounded-lg`}
                >
                  {score >= 70 ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                  <div>
                    <p className="font-medium">Confidence Score: {score}%</p>
                    <p className="text-sm text-gray-400">
                      {score >= 70 ? "Verified" : "Not Verified"}
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleVerification}
                  disabled={loading}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify News"
                  )}
                </button>

                <button
                  onClick={handleSubmission}
                  disabled={!score || score < 70 || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit News"
                  )}
                </button>
              </div>

              {success && id && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-green-400 bg-green-400/10 p-4 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  <p>
                    News submitted successfully! ID: <span className="font-mono">{id}</span>
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}