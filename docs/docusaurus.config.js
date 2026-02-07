// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'React Native Shared Passwords',
  tagline: 'Cross-platform password and passkey management for React Native',
  favicon: 'img/favicon.ico',

  url: 'https://aryan-dwivedi.github.io',
  baseUrl: '/react-native-shared-passwords/',

  organizationName: 'aryan-dwivedi',
  projectName: 'react-native-shared-passwords',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/aryan-dwivedi/react-native-shared-passwords/tree/main/docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'RN Shared Passwords',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/aryan-dwivedi/react-native-shared-passwords',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/intro',
              },
              {
                label: 'API Reference',
                to: '/docs/api-reference',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/aryan-dwivedi/react-native-shared-passwords',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} React Native Shared Passwords. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
    }),
};

module.exports = config;
