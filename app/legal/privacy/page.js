export const metadata = {
  title: "Privacy Policy — Sceneviz",
  alternates: {
    canonical: "/legal/privacy",
  },
};

function Section({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="border-l-2 border-primary/40 pl-3 font-display text-lg font-bold tracking-tight text-primary-text">
        {title}
      </h2>
      <div className="mt-3 space-y-3 pl-3 text-sm leading-relaxed text-secondary-text">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <article className="max-w-none">
      <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-xs leading-relaxed text-amber-200">
        Placeholder for legal review — have counsel confirm before relying on
        this text.
      </p>

      <h1 className="mt-8 font-display text-3xl font-bold tracking-tight text-primary-text">
        Privacy Policy
      </h1>
      <p className="mt-2 text-xs text-secondary-text">
        Effective date: November 3, 2026
      </p>

      <Section title="Who we are">
        <p>
          Sceneviz (&ldquo;Sceneviz&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;)
          is an AI media generation studio operated by{" "}
          <strong className="font-semibold text-primary-text">
            Opraiz Technology Pvt Ltd
          </strong>
          , available at{" "}
          <a
            href="https://sceneviz.opraiz.com"
            className="text-primary transition-colors hover:underline"
          >
            https://sceneviz.opraiz.com
          </a>
          . This policy explains what information we handle, why, and the
          choices you have. If you have questions, contact us at{" "}
          <a
            href="mailto:support@opraiz.com"
            className="text-primary transition-colors hover:underline"
          >
            support@opraiz.com
          </a>
          .
        </p>
      </Section>

      <Section title="What we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-primary-text">
              Account email.
            </strong>{" "}
            Only if you choose to provide one, so we can identify your account
            and contact you about it.
          </li>
          <li>
            <strong className="font-semibold text-primary-text">
              API keys.
            </strong>{" "}
            Keys you supply to use the service are stored{" "}
            <strong className="font-semibold text-primary-text">hashed</strong>{" "}
            — we never store them in plaintext and cannot display them back to
            you.
          </li>
          <li>
            <strong className="font-semibold text-primary-text">
              Usage metadata.
            </strong>{" "}
            Technical records such as request counts, timestamps and credits
            consumed, used to operate, meter and protect the service.
          </li>
          <li>
            <strong className="font-semibold text-primary-text">
              Your media.
            </strong>{" "}
            Images, audio and video you upload, and the output we generate for
            you, are stored in object storage so we can deliver and re-serve
            your results.
          </li>
        </ul>
      </Section>

      <Section title="What we don't do">
        <p>
          We do not sell your personal data. We do not run advertising
          trackers, and we do not use your content to target you with ads.
        </p>
      </Section>

      <Section title="Third-party processing">
        <p>
          When you request a generation, the content you submit is processed by
          automated machine-learning models operated by third-party GPU
          infrastructure providers, solely to fulfill your request. We do not
          use your content for any other purpose in that flow. We recommend not
          submitting personal data or confidential material in prompts or
          uploads that a generation request does not require.
        </p>
      </Section>

      <Section title="Storage &amp; retention">
        <p>
          Uploaded media and generated output are retained until you delete
          them or your account is closed. Usage metadata may be kept for
          billing integrity, abuse prevention and legal compliance.
        </p>
      </Section>

      <Section title="Security">
        <p>
          API keys are stored only as cryptographic hashes. All transport
          between your browser and our services uses HTTPS. No system is
          perfectly secure, so please keep your keys secret and contact us
          immediately if you suspect unauthorized use.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You may request access to, correction of, or deletion of the personal
          data we hold about you by emailing{" "}
          <a
            href="mailto:support@opraiz.com"
            className="text-primary transition-colors hover:underline"
          >
            support@opraiz.com
          </a>
          . We will verify the request before acting on it and respond within a
          reasonable timeframe.
        </p>
      </Section>

      <Section title="Children">
        <p>
          Sceneviz is not directed to children under 13, and we do not
          knowingly collect personal data from children under 13. If you
          believe a child under 13 has provided us personal data, contact us
          and we will delete it.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this policy as the service evolves. Material changes
          will be announced on the site or by email, and the effective date at
          the top of this page will change.
        </p>
      </Section>

      <Section title="Contact &amp; governing entity">
        <p>
          This policy is issued by Opraiz Technology Pvt Ltd. Reach us at{" "}
          <a
            href="mailto:support@opraiz.com"
            className="text-primary transition-colors hover:underline"
          >
            support@opraiz.com
          </a>{" "}
          for any privacy question or request.
        </p>
      </Section>
    </article>
  );
}
