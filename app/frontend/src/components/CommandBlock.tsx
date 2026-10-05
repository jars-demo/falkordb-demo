import { useState } from 'react'

// A terminal-style block of shell commands with a Copy button.
// Lines starting with "#" are comments: shown dimmed, and left out of what gets copied.

interface Props {
  title?: string
  lines: string[]
}

export function CommandBlock({ title = 'Terminal', lines }: Props) {
  const [copied, setCopied] = useState(false)
  const commands = lines.filter((line) => line.trim() && !line.trim().startsWith('#'))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(commands.join('\n'))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable: the commands are still there to select by hand */
    }
  }

  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="terminal-title">{title}</span>
        <button type="button" className="terminal-copy" onClick={copy} aria-label="Copy commands">
          <svg className="terminal-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="terminal-body">
        {lines.map((line, index) =>
          line.trim().startsWith('#') ? (
            <span className="terminal-comment" key={index}>
              {line}
              {'\n'}
            </span>
          ) : line.trim() ? (
            <span className="terminal-line" key={index}>
              <span className="terminal-prompt" aria-hidden="true">$</span>
              {line}
              {'\n'}
            </span>
          ) : (
            <span key={index}>{'\n'}</span>
          ),
        )}
      </pre>
    </div>
  )
}
