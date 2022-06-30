interface Base {
  label: string;
  project: string;
}

export interface AppService extends Base {
  type: 'app';
}

export interface ApiService extends Base {
  type: 'api';
  url: string;
}

export type Services = Array<AppService | ApiService>;

interface Selectable {
  selected: boolean;
}

export type SelectableServices = Array<(AppService & Selectable) | (ApiService & Selectable)>;
