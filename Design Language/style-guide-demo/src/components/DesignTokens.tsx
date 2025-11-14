import React from 'react';
import { Copy, Check } from 'lucide-react';

const DesignTokens: React.FC = () => {
  const [copiedToken, setCopiedToken] = useState<string>('');

  const copyToClipboard = (token: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(''), 2000);
  };

  const colorTokens = [
    { name: 'backgroundMain', value: '#D6F25F', description: 'Main background color' },
    { name: 'surfacePrimary', value: '#FFFFFF', description: 'Primary surface color' },
    { name: 'surfaceSoft', value: '#F9FAFB', description: 'Soft surface color' },
    { name: 'textPrimary', value: '#111111', description: 'Primary text color' },
    { name: 'textSecondary', value: '#555555', description: 'Secondary text color' },
    { name: 'textMuted', value: '#9CA3AF', description: 'Muted text color' },
    { name: 'accentPrimary', value: '#7B3EFF', description: 'Primary accent color' },
    { name: 'accentPrimarySoft', value: '#EDE7FF', description: 'Soft accent color' },
    { name: 'accentSecondary', value: '#00C6AE', description: 'Secondary accent color' },
    { name: 'accentYellow', value: '#FFB020', description: 'Yellow accent color' },
    { name: 'borderSubtle', value: '#F0F0F0', description: 'Subtle border color' },
    { name: 'success', value: '#10B981', description: 'Success color' },
    { name: 'warning', value: '#FBBF24', description: 'Warning color' },
    { name: 'danger', value: '#EF4444', description: 'Danger color' },
  ];

  const spacingTokens = [
    { name: 'xxs', value: '4px', description: 'Extra extra small spacing' },
    { name: 'xs', value: '6px', description: 'Extra small spacing' },
    { name: 'sm', value: '8px', description: 'Small spacing' },
    { name: 'md', value: '12px', description: 'Medium spacing' },
    { name: 'lg', value: '16px', description: 'Large spacing' },
    { name: 'xl', value: '20px', description: 'Extra large spacing' },
    { name: 'xxl', value: '24px', description: 'Extra extra large spacing' },
    { name: 'xxxl', value: '32px', description: 'Triple extra large spacing' },
  ];

  const typographyTokens = [
    { name: 'h1', value: '28px / 1.3 / 600', description: 'Main heading' },
    { name: 'h2', value: '22px / 1.35 / 600', description: 'Secondary heading' },
    { name: 'h3', value: '18px / 1.4 / 500', description: 'Tertiary heading' },
    { name: 'body-lg', value: '16px / 1.5 / 400', description: 'Large body text' },
    { name: 'body', value: '14px / 1.5 / 400', description: 'Body text' },
    { name: 'body-bold', value: '14px / 1.4 / 500', description: 'Bold body text' },
    { name: 'label', value: '12px / 1.3 / 500', description: 'Label text' },
  ];

  const radiusTokens = [
    { name: 'pill', value: '9999px', description: 'Pill-shaped radius' },
    { name: 'cardLarge', value: '28px', description: 'Large card radius' },
    { name: 'cardMedium', value: '20px', description: 'Medium card radius' },
    { name: 'button', value: '9999px', description: 'Button radius' },
    { name: 'input', value: '9999px', description: 'Input radius' },
    { name: 'avatar', value: '9999px', description: 'Avatar radius' },
  ];

  const shadowTokens = [
    { name: 'card', value: '0 10px 25px 0 rgba(15, 23, 42, 0.06)', description: 'Card shadow' },
    { name: 'floating', value: '0 18px 40px 0 rgba(15, 23, 42, 0.10)', description: 'Floating shadow' },
  ];

  return (
    <div className="space-y-8">
      {/* Color Tokens */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 text-textPrimary">Color Tokens</h2>
          <span className="badge">14 tokens</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorTokens.map((token) => (
            <div key={token.name} className="border border-borderSubtle rounded-lg p-4 hover:shadow-card transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-lg border border-borderSubtle"
                  style={{ backgroundColor: token.value }}
                ></div>
                <button
                  onClick={() => copyToClipboard(token.name, token.value)}
                  className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft rounded-lg transition-all duration-200"
                >
                  {copiedToken === token.name ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <h4 className="text-body-bold text-textPrimary mb-1">{token.name}</h4>
              <p className="text-label text-textSecondary mb-2">{token.description}</p>
              <code className="text-body text-accentPrimary bg-accentPrimarySoft px-2 py-1 rounded">
                {token.value}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing Tokens */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 text-textPrimary">Spacing Tokens</h2>
          <span className="badge">8 tokens</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {spacingTokens.map((token) => (
            <div key={token.name} className="border border-borderSubtle rounded-lg p-4 hover:shadow-card transition-all duration-200">
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className="bg-accentPrimary rounded"
                  style={{ width: token.value, height: '16px' }}
                ></div>
                <button
                  onClick={() => copyToClipboard(token.name, token.value)}
                  className="p-1 text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft rounded transition-all duration-200"
                >
                  {copiedToken === token.name ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <h4 className="text-body-bold text-textPrimary mb-1">{token.name}</h4>
              <p className="text-label text-textSecondary mb-2">{token.description}</p>
              <code className="text-body text-accentPrimary bg-accentPrimarySoft px-2 py-1 rounded">
                {token.value}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Typography Tokens */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 text-textPrimary">Typography Tokens</h2>
          <span className="badge">7 tokens</span>
        </div>
        
        <div className="space-y-4">
          {typographyTokens.map((token) => (
            <div key={token.name} className="border border-borderSubtle rounded-lg p-4 hover:shadow-card transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-body-bold text-textPrimary mb-1">{token.name}</h4>
                  <p className="text-label text-textSecondary mb-2">{token.description}</p>
                  <code className="text-body text-accentPrimary bg-accentPrimarySoft px-2 py-1 rounded">
                    {token.value}
                  </code>
                </div>
                <div className="text-right">
                  <div
                    className="text-textPrimary mb-2"
                    style={{
                      fontSize: token.value.split(' / ')[0],
                      lineHeight: token.value.split(' / ')[1],
                      fontWeight: token.value.split(' / ')[2],
                    }}
                  >
                    Sample Text
                  </div>
                  <button
                    onClick={() => copyToClipboard(token.name, token.value)}
                    className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft rounded-lg transition-all duration-200"
                  >
                    {copiedToken === token.name ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Border Radius Tokens */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 text-textPrimary">Border Radius Tokens</h2>
          <span className="badge">6 tokens</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {radiusTokens.map((token) => (
            <div key={token.name} className="border border-borderSubtle rounded-lg p-4 hover:shadow-card transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-16 h-16 bg-accentPrimary"
                  style={{ borderRadius: token.value }}
                ></div>
                <button
                  onClick={() => copyToClipboard(token.name, token.value)}
                  className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft rounded-lg transition-all duration-200"
                >
                  {copiedToken === token.name ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <h4 className="text-body-bold text-textPrimary mb-1">{token.name}</h4>
              <p className="text-label text-textSecondary mb-2">{token.description}</p>
              <code className="text-body text-accentPrimary bg-accentPrimarySoft px-2 py-1 rounded">
                {token.value}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Shadow Tokens */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 text-textPrimary">Shadow Tokens</h2>
          <span className="badge">2 tokens</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shadowTokens.map((token) => (
            <div key={token.name} className="border border-borderSubtle rounded-lg p-6 hover:shadow-card transition-all duration-200">
              <div
                className="w-full h-24 bg-surfacePrimary rounded-lg mb-4"
                style={{ boxShadow: token.value }}
              ></div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-body-bold text-textPrimary mb-1">{token.name}</h4>
                  <p className="text-label text-textSecondary mb-2">{token.description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(token.name, token.value)}
                  className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceSoft rounded-lg transition-all duration-200"
                >
                  {copiedToken === token.name ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <code className="text-body text-accentPrimary bg-accentPrimarySoft px-2 py-1 rounded block mt-2">
                {token.value}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Variables Export */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 text-textPrimary">CSS Variables</h2>
          <button
            onClick={() => {
              const cssVars = `:root {
  /* Colors */
  ${colorTokens.map(token => `--${token.name}: ${token.value};`).join('\n  ')}
  
  /* Spacing */
  ${spacingTokens.map(token => `--spacing-${token.name}: ${token.value};`).join('\n  ')}
  
  /* Border Radius */
  ${radiusTokens.map(token => `--radius-${token.name}: ${token.value};`).join('\n  ')}
  
  /* Shadows */
  ${shadowTokens.map(token => `--shadow-${token.name}: ${token.value};`).join('\n  ')}
}`;
              copyToClipboard('css-variables', cssVars);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Copy size={16} />
            <span>Copy All CSS</span>
          </button>
        </div>
        
        <div className="bg-surfaceSoft rounded-lg p-4 overflow-x-auto">
          <pre className="text-body text-textPrimary">
            <code>{`:root {
  /* Colors */
  ${colorTokens.map(token => `--${token.name}: ${token.value};`).join('\n  ')}
  
  /* Spacing */
  ${spacingTokens.map(token => `--spacing-${token.name}: ${token.value};`).join('\n  ')}
  
  /* Border Radius */
  ${radiusTokens.map(token => `--radius-${token.name}: ${token.value};`).join('\n  ')}
  
  /* Shadows */
  ${shadowTokens.map(token => `--shadow-${token.name}: ${token.value};`).join('\n  ')}
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DesignTokens;
