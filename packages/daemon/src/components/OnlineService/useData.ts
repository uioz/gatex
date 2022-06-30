import {useState, useMemo} from 'react';
import {type Services, type SelectableServices} from './index.type';

async function fetchData() {
  const response = await fetch('/api/service');

  if (response.status === 200) {
    return (await response.json()) as Services;
  }
}

export function useData(
  service: Services,
  setService: React.Dispatch<React.SetStateAction<Services>>
) {
  const [selectableServices, setSelectableServices] = useState<SelectableServices>([]);
  const [projectNames, setProjectNames] = useState<Array<string>>([]);
  const [currentProject, setCurrentProject] = useState('all');
  const [types, setTypes] = useState<Array<string>>([]);
  const [currentType, setCurrentType] = useState('all');

  const data = useMemo(() => {
    if (currentProject === 'all' && currentType === 'all') {
      return selectableServices;
    }

    return selectableServices
      .filter((item) => {
        if (currentProject === 'all') {
          return true;
        }
        return item.project === currentProject;
      })
      .filter((item) => {
        if (currentType === 'all') {
          return true;
        }

        return item.type === currentType;
      });
  }, [selectableServices, currentProject, currentType]);

  return {
    data,
    selectedData: useMemo(() => data.filter((item) => item.selected), [data]),
    projectNames,
    currentProject,
    setCurrentProject,
    types,
    currentType,
    setCurrentType,
    toggleSelection({project, label}: {project: string; label: string}) {
      setSelectableServices(
        selectableServices.map((item) => {
          if (item.project === project && item.label === label) {
            item.selected = !item.selected;
          }
          return item;
        })
      );
    },
    toggleAll(selected: boolean) {
      setSelectableServices(
        selectableServices.map((item) => {
          if (data.indexOf(item) !== -1) {
            item.selected = selected;
          }
          return item;
        })
      );
    },
    fetch() {
      fetchData().then((service) => {
        if (service) {
          setService(service);

          setSelectableServices(service.map((item) => ({...item, selected: false})));

          setProjectNames(Array.from(new Set(service.map((item) => item.project))));
          setTypes(Array.from(new Set(service.map((item) => item.type))));
        }
      });
    },
  };
}
