
import React, { useState } from "react";
import {
  GitCompareArrows,
  Tag,
  MapPin,
  Clock,
  ChartNoAxesCombined,
  X,
  CheckCircle2,
} from "lucide-react";
import "./FusionMatch.css";

const factors = [
  {
    icon: Tag,
    title: "Category Matching",
    weight: "10%",
    description:
      "Compares the categories of lost and found items, such as bags, bottles, phones, and books.",
  },
  {
    icon: MapPin,
    title: "Location Matching",
    weight: "10%",
    description:
      "Compares the reported lost and found locations to help identify items that may be related.",
  },
  {
    icon: Clock,
    title: "Time Matching",
    weight: "10%",
    description:
      "Evaluates the reported dates and times to estimate whether the reports could refer to the same item.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Weighted Match Score",
    weight: "Combined",
    description:
      "Combines image, text, category, location, and time scores into one overall matching score.",
  },
];

export default function FusionMatch() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="fusion-card"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-label="Learn about FusionMatch AI"
      >
        <div className="fusion-icon">
          <GitCompareArrows size={30} />
        </div>

        <h3>FusionMatch AI</h3>

        <p>
          Multi-factor matching that evaluates lost and found reports using
          category, location, time, and a weighted score.
        </p>

        <span className="fusion-link">
          Explore feature <span aria-hidden="true">→</span>
        </span>
      </button>

      {isOpen && (
        <div
          className="fusion-overlay"
          onClick={() => setIsOpen(false)}
        >
          <section
            className="fusion-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fusion-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="fusion-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close FusionMatch details"
            >
              <X size={22} />
            </button>

            <div className="fusion-modal-heading">
              <div className="fusion-icon">
                <GitCompareArrows size={28} />
              </div>

              <div>
                <h2 id="fusion-title">FusionMatch AI</h2>
                <p>Intelligent Multi-Factor Matching</p>
              </div>
            </div>

            <p className="fusion-intro">
              FusionMatch AI evaluates multiple factors to help identify
              potential matches between lost and found items.
            </p>

            <div className="fusion-factor-list">
              {factors.map((factor) => {
                const Icon = factor.icon;

                return (
                  <article className="fusion-factor" key={factor.title}>
                    <div className="fusion-factor-icon">
                      <Icon size={22} />
                    </div>

                    <div className="fusion-factor-content">
                      <div className="fusion-factor-title">
                        <h3>{factor.title}</h3>
                        <span>{factor.weight}</span>
                      </div>

                      <p>{factor.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="fusion-score-note">
              <CheckCircle2 size={20} />
              <p>
                <strong>Current scoring weights:</strong> Image 50%, Text 20%,
                Category 10%, Location 10%, and Time 10%.
              </p>
            </div>

            <button
              type="button"
              className="fusion-done"
              onClick={() => setIsOpen(false)}
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </>
  );
}
