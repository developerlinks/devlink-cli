import { request } from '@devlink/cli-utils';

export function fetchMaterials() {
  return request({
    url: '/material',
  });
}

export function fetchMyGroups() {
  return request({
    url: '/group',
  });
}

export function fetchMaterialsByGroupId(groupId: string) {
  return request({
    url: `/group/${groupId}/materials`,
  });
}

export function fetchMyCollectionGroup() {
  return request({
    url: '/collection_group',
  });
}

export function fetchMaterialsByCollectionGroupId(groupId: string) {
  return request({
    url: `/collection_group/${groupId}`,
  });
}
