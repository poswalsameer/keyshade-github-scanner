'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from 'axios'
// import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [repo, setRepo] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [results, setResults] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault()
    if (!repo) {
      alert("No repo link entered");
      return;
    }
    setLoading(true)
    try {
      const data = await axios.post('/api/scan-repo', 
        { repoUrl: repo },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log("Result from the API: ", data.data.message[0]);
      alert(data.data.message[0]);
      setResults(data.data.results || []);
    } catch (error) {
      console.error('Error:', error);
      setResults(['Failed to scan the repository.']);
    } finally {
      setLoading(false);
    }

    setRepo('')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-gray-900 text-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">GitHub Scanner</CardTitle>
          <CardDescription className="text-gray-400">Enter your GitHub repository to scan for secret files</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Repository Link"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="bg-gray-800 text-white placeholder-gray-500 border-gray-700 focus:border-gray-500"
            />
            <Button type="submit" className="w-full bg-gray-700 hover:bg-gray-600 text-white" disabled={loading}>
              {loading ? 'Processing...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

