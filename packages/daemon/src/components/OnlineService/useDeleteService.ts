import {type Services} from './index.type';

export function useDeleteService(serviceWillDelete: Services) {
  return {
    deleteService() {
      return Promise.all(
        serviceWillDelete.map(({project, type, label}) => {
          if (type === 'api') {
            return fetch(`/api/service/api/${project}/${label}`, {
              method: 'DELETE',
            });
          } else if (type === 'app') {
            return fetch(`/api/service/app/${project}/${label}`, {
              method: 'DELETE',
            });
          }

          return undefined;
        })
      );
    },
  };
}
