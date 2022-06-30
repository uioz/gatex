import {createContext, useContext, useState} from 'react';

export function useInitialStore() {
  const [projects, updateProjects] = useState<Array<string>>([]);

  return {
    projects,
    updateProjects,
  };
}

export const ProjectContext = createContext<{
  projects: Array<string>;
  updateProjects: (data: Array<string>) => void;
}>(undefined as any);

export function useProjectStore() {
  return useContext(ProjectContext);
}
