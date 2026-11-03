export const metadata = {
  title: "Terms of Service — Sceneviz",
  alternates: {
    canonical: "/legal/terms",
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

export default function TermsOfServicePage() {
  return (
    <article className="max-w-none">
      <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-xs leading-relaxed text-amber-200">
        Placeholder for legal review — have counsel confirm before relying on
        this text.
      </p>

      <h1 className="mt-8 font-display text-3xl font-bold tracking-tight text-primary-text">
        Terms of Service
      </h1>
      <p className="mt-2 text-xs text-secondary-text">
        Effective date: November 3, 2026
      </p>

      <Section title="Acceptance">
        <p>
          By accessing or using Sceneviz, you agree to these Terms of Service.
          If you do not agree, do not use the service.
        </p>
      </Section>

      <Section title="The service">
        <p>
          Sceneviz is an AI media generation studio operated by Opraiz
          Technology Pvt Ltd at https://sceneviz.opraiz.com. It lets you
          generate images, video, audio and related media from prompts and
          uploads using machine-learning models.
        </p>
      </Section>

      <Section title="Eligibility">
        <p>
          You must be at least 13 years old to use the service. You must be at
          least 18 years old (or the age of legal majority in your
          jurisdiction) to make purchases on the service.
        </p>
      </Section>

      <Section title="Accounts &amp; API keys">
        <p>
          The service may be used with an API key that you supply or connect.
          You are solely responsible for keeping your key secret and for all
          activity that occurs under it. API keys are credits-bearing: usage
          through a key consumes the credits attached to it. Do not share your
          key in public code, screenshots or client-side code you do not
          control. Treat a leaked key as compromised and rotate it
          immediately.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>You must not use the service to create or distribute:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>content that is illegal under applicable law;</li>
          <li>
            content that sexualizes minors (CSAM) — we have{" "}
            <strong className="font-semibold text-primary-text">
              zero tolerance
            </strong>
            ; such use is reported to the relevant authorities and the account
            is banned;
          </li>
          <li>
            non-consensual intimate imagery, including sexualized depictions of
            real people made without their consent;
          </li>
          <li>
            content that impersonates a real person or organization in a
            deceptive or misleading way;
          </li>
          <li>
            material that infringes copyright, trademark, privacy or other
            rights of others;
          </li>
          <li>malware, exploits, or code intended to harm systems or users.</li>
        </ul>
        <p>
          You must not attempt to bypass rate limits, credit metering or other
          usage controls of the service. We may suspend or terminate accounts
          that violate these rules.
        </p>
      </Section>

      <Section title="Your content">
        <p>
          You own your prompts and your generated output, to the extent
          permitted by law and subject to any rights in underlying materials.
          You grant us a limited license to store, process and serve your
          uploads and output solely as needed to operate and deliver the
          service to you. You are responsible for having the rights to the
          material you upload.
        </p>
      </Section>

      <Section title="Third-party models">
        <p>
          Generation runs on third-party machine-learning models. Model outputs
          may be inaccurate, unexpected, or differ between runs. Some models
          carry their own license terms that may apply to their outputs; it is
          your responsibility to review applicable licenses for commercial use.
        </p>
      </Section>

      <Section title="Credits &amp; payment">
        <p>
          Credits are purchased in advance and consumed as you use the service.
          Credits are non-transferable between accounts.{" "}
          <strong className="font-semibold text-primary-text">
            Used credits are non-refundable.
          </strong>{" "}
          Prices and credit rates may change; we will give notice of changes
          before they take effect.
        </p>
      </Section>

      <Section title="Availability">
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;. This version carries no service-level agreement
          (SLA); availability may vary and features may change or be
          discontinued.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, Opraiz Technology Pvt Ltd
          will not be liable for indirect, incidental, special, consequential
          or punitive damages, or for lost profits, data or goodwill, arising
          from your use of the service. Our aggregate liability for any claim
          relating to the service is limited to the amount you paid us for the
          service in the twelve months preceding the claim.
        </p>
      </Section>

      <Section title="Termination">
        <p>
          You may stop using the service at any time. We may suspend or
          terminate your access, including for abuse, violation of these
          terms, or non-payment. On termination, sections that should
          reasonably survive (including credits, liability and governing law)
          do so.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may update these terms as the service evolves. Material changes
          will be announced on the site or by email, and the effective date at
          the top of this page will change. Continued use after changes take
          effect means you accept the updated terms.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of India.{" "}
          <strong className="font-semibold text-primary-text">
            [PLACEHOLDER — courts of appropriate jurisdiction to be specified
            during legal review.]
          </strong>
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? Contact us at{" "}
          <a
            href="mailto:support@opraiz.com"
            className="text-primary transition-colors hover:underline"
          >
            support@opraiz.com
          </a>
          .
        </p>
      </Section>
    </article>
  );
}
