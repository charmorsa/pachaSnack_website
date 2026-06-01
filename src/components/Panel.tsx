import type { ReactNode } from 'react';

type PanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  aside?: ReactNode;
};

export function Panel({ title, description, children, aside }: PanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
