import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

const TerminalUI = ({ socket }) => {
  const termRef = useRef(null);
  const terminal = useRef(null);

  useEffect(() => {
    terminal.current = new Terminal({
      fontSize: 14,
      theme: { background: "#1e1e1e" },
      cursorBlink: true,
    });

    terminal.current.open(termRef.current);
    terminal.current.writeln("👋 Welcome to C++ Online Compiler");

    socket.on("output", (data) => {
      terminal.current.write(data);
    });

    socket.on("inputRequest", () => {
      terminal.current.write("\n> ");
      terminal.current.focus();

      const onData = (input) => {
        socket.emit("provideInput", input);
        terminal.current.write(input); // optional: echo input
        terminal.current.off("data", onData); // wait only once
      };

      terminal.current.onData(onData);
    });

    return () => {
      socket.off("output");
      socket.off("inputRequest");
    };
  }, [socket]);

  return <div ref={termRef} className="h-[300px] w-full rounded-lg overflow-hidden" />;
};

export default TerminalUI;
