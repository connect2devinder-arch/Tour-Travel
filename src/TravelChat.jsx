import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ASSISTANT_QUESTION_LIMIT,
  ASSISTANT_SUGGESTIONS,
  askTravelAssistant,
  assistantErrorMessage,
} from "./travelAssistant.js";

export function TravelChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const logRef = useRef(null);

  // Escape closes the panel from anywhere on the page.
  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Move focus into the composer when the panel opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    const node = logRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, pending]);

  async function send(questionText) {
    const question = String(questionText ?? "").trim();
    if (!question || pending) return;

    if (question.length > ASSISTANT_QUESTION_LIMIT) {
      setError(`Please keep your question under ${ASSISTANT_QUESTION_LIMIT} characters.`);
      return;
    }

    const history = messages.slice(-12);
    setError("");
    setDraft("");
    setMessages((current) => [...current, { role: "user", text: question }]);
    setPending(true);

    try {
      const result = await askTravelAssistant(question, history);
      setMessages((current) => [
        ...current,
        { role: "assistant", text: result.answer, sources: result.sources },
      ]);
    } catch (sendError) {
      setError(assistantErrorMessage(sendError));
    } finally {
      setPending(false);
    }
  }

  const showSuggestions = messages.length === 0 && !pending;

  return (
    <div className={`travel-chat${open ? " is-open" : ""}`}>
      <button
        className="travel-chat-launcher"
        type="button"
        aria-expanded={open}
        aria-controls="travel-chat-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="travel-chat-launcher-icon" aria-hidden="true">✎</span>
        <span className="travel-chat-launcher-label">Ask us anything</span>
      </button>

      {open && (
        <section className="travel-chat-panel" id="travel-chat-panel" aria-label="Travel assistant">
          <header className="travel-chat-head">
            <div>
              <p className="eyebrow">ELSEWHERE ASSISTANT</p>
              <h2>Ask about a trip</h2>
            </div>
            <button
              className="travel-chat-close"
              type="button"
              aria-label="Close travel assistant"
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div className="travel-chat-log" ref={logRef} aria-live="polite">
            {showSuggestions && (
              <div className="travel-chat-intro">
                <p>
                  Hi! I can answer questions about our destinations, packages, prices and itineraries.
                </p>
                <p className="travel-chat-intro-note">
                  I only know what is published on this site. For anything exact, our team will confirm it
                  for you.
                </p>
                <p className="travel-chat-suggestions-label">Try one of these:</p>
                <ul className="travel-chat-suggestions">
                  {ASSISTANT_SUGGESTIONS.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        className="travel-chat-suggestion"
                        type="button"
                        onClick={() => send(suggestion)}
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {messages.map((message, index) => (
              <div className={`travel-chat-message is-${message.role}`} key={`${message.role}-${index}`}>
                <p className="travel-chat-bubble">{message.text}</p>
                {message.sources?.length > 0 && (
                  <ul className="travel-chat-sources">
                    {message.sources.map((source) => (
                      <li key={`${source.kind}-${source.url}`}>
                        <Link to={source.url}>
                          {source.kind === "package" ? "Package" : "Article"}: {source.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {pending && (
              <p className="travel-chat-typing" role="status">
                Thinking…
              </p>
            )}
          </div>

          {error && (
            <p className="travel-chat-error" role="alert">
              {error}
            </p>
          )}

          <form
            className="travel-chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              send(draft);
            }}
          >
            <label className="visually-hidden" htmlFor="travel-chat-input">
              Your question for the travel assistant
            </label>
            <textarea
              className="travel-chat-input"
              id="travel-chat-input"
              ref={inputRef}
              rows="2"
              maxLength={ASSISTANT_QUESTION_LIMIT}
              value={draft}
              placeholder="Ask about a destination, price or itinerary…"
              onChange={(event) => {
                setDraft(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(draft);
                }
              }}
            />
            <div className="travel-chat-actions">
              {draft.length > 0 && (
                <span className="travel-chat-count">
                  {draft.length}/{ASSISTANT_QUESTION_LIMIT}
                </span>
              )}
              <button className="travel-chat-send" type="submit" disabled={pending || !draft.trim()}>
                {pending ? "Sending…" : "Send"} <span aria-hidden="true">↗</span>
              </button>
            </div>
            <p className="travel-chat-disclaimer">
              Answers come from our published packages and journal. Prices are sample prices, not final
              quotes.
            </p>
          </form>
        </section>
      )}
    </div>
  );
}
