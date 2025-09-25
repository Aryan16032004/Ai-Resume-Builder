import React, { lazy, Suspense } from 'react';

const TemplateLoader = ({ templateName, data, id }) => {
  const validTemplates = ["GeneralPreview", "SpecializedPreview"];
  if (!templateName || !validTemplates.includes(templateName)) {
    console.error('Invalid or missing templateName:', { templateName, data, id });
    return <div style={{color: 'red', padding: '2rem'}}>Error: Invalid resume template selected.</div>;
  }

  const TemplateComponent = lazy(() => import(`./Template/${templateName}.jsx`));

  return (
    <Suspense>
      <TemplateComponent data={data} id={id} />
    </Suspense>
  );
};

export default TemplateLoader;