import React from 'react';
import DOMPurify from 'dompurify';
import FormDisplay from '@/components/FormDisplay';

const ShortcodeParser = ({ content }) => {
  if (!content || typeof content !== 'string') {
    return null;
  }

  // Regex handles both standalone shortcodes and those wrapped in <p> tags by rich text editors
  // This prevents empty <p></p> tags from remaining in the DOM or breaking the layout
  const shortcodePattern = /(?:<p>\s*\[smarketer_form\]\s*<\/p>)|(?:\[smarketer_form\])/g;
  
  if (!shortcodePattern.test(content)) {
    return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />;
  }

  const parts = content.split(shortcodePattern);
  
  return (
    <>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part && <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(part) }} />}
          {index < parts.length - 1 && (
            <div className="my-8 not-prose">
              <FormDisplay />
            </div>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default ShortcodeParser;