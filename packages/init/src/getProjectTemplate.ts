import { request } from '@devlink/cli-utils';

export function fetchMaterials() {
  return request({
    url: '/material',
  });
}

export function fetchMyMaterials() {
  return request({
    url: '/material/myself',
  });
}

export function fetchMyGroups() {
  return request({
    url: '/group',
  });
}
