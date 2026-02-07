import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary')} style={{ padding: '4rem 0' }}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div style={{ marginTop: '2rem' }}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            Get Started →
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <HomepageHeader />
      <main style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="row">
            <div className="col col--4">
              <h3>🔐 Password Autofill</h3>
              <p>
                Seamlessly integrate with iOS Keychain and Android Credential Manager for native
                password autofill support.
              </p>
            </div>
            <div className="col col--4">
              <h3>🔑 Passkey Support</h3>
              <p>
                Enable passwordless authentication with modern passkey support on both platforms.
              </p>
            </div>
            <div className="col col--4">
              <h3>📱 Cross-Platform</h3>
              <p>
                A unified API that works across iOS and Android with platform-specific
                optimizations.
              </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
