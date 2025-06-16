import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { Play, Terminal, XCircle, Code2 } from 'lucide-react';

const defaultCode = `#include <iostream>
using namespace std;

int main() {
    int vec[5];
    for(int i = 0; i < 5; i++) {
        int x;
        cout << "Enter number " << i+1 << ": ";
        cin >> x;
        vec[i] = x;
    }
    for(int i = 0; i < 5; i++) {
        cout << vec[i] << " ";
    }
    return 0;
}`;

function App() {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('https://coderunner-backend-o7at.onrender.com');

    socketRef.current.on('output', (data) => {
      setOutput(prev => prev + data);
      scrollToBottom();
    });

    socketRef.current.on('inputRequest', () => {
      setIsWaitingForInput(true);
    });

    socketRef.current.on('executionEnd', () => {
      setIsRunning(false);
      setIsWaitingForInput(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('');
    socketRef.current?.emit('runCode', { code });
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      socketRef.current?.emit('provideInput', input);
      setOutput(prev => prev + '\n> ' + input + '\n');
      setInput('');
      setIsWaitingForInput(false);
      scrollToBottom();
    }
  };

  const handleClearOutput = () => {
    setOutput('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Code2 className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Online C++ Compiler</h1>
          {isRunning && (
          <div className="bg-yellow-200 text-yellow-900 p-3 rounded-md mb-4 border border-yellow-300 text-sm flex items-center gap-2">
            ⚠️ This app is hosted on a free-tier server, so code execution might take a few seconds. Thanks for your patience!
          </div>
          )}

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Editor</h2>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  isRunning
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
            </div>
            <Editor
              height="60vh"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-semibold">Output</h2>
              </div>
              <button
                onClick={handleClearOutput}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div
              ref={outputRef}
              className="h-[60vh] overflow-y-auto p-4 font-mono text-sm bg-black"
            >
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
          </div>
        </div>

        {isWaitingForInput && (
          <div className="mt-6">
            <form onSubmit={handleInputSubmit} className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input..."
                className="flex-1 px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Submit
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
