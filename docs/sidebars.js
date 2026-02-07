/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    'installation',
    {
      type: 'category',
      label: 'Platform Setup',
      items: ['ios-setup', 'android-setup', 'expo-setup'],
    },
    'api-reference',
    'passkeys',
    'troubleshooting',
  ],
};

module.exports = sidebars;
