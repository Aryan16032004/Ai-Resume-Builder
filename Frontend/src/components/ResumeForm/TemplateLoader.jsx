import React, { lazy, Suspense } from 'react';

const TemplateLoader = ({ templateName, data, id }) => {
  if (!templateName) {
    console.error('Missing templateName:', { templateName, data, id });
    throw new Error('Template name is required');
  }

  const TemplateComponent = lazy(() => import(`./Template/${templateName}.jsx`));

  return (
    <Suspense>
      <TemplateComponent data={data} id={id} />
    </Suspense>
  );
};

export default TemplateLoader;