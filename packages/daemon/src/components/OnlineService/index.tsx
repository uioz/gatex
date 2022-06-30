import React, {useEffect, useState, useContext} from 'react';
import {
  Box,
  Table,
  TableBody,
  TableHead,
  TableContainer,
  TableCell,
  TableRow,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Paper,
  Checkbox,
} from '@mui/material';
import {ProjectContext} from '../../store/project';
import Clone from './Clone';
import Toolbar from './Toolbar';
import {useData} from './useData';
import {useDeleteService} from './useDeleteService';
import {Services} from './index.type';
import {on, off} from '../../utils/eventBus';

export default function OnlineService() {
  const [services, setServices] = useState<Services>([]);

  const {
    fetch,
    data,
    selectedData,
    toggleSelection,
    toggleAll,
    projectNames,
    currentProject,
    setCurrentProject,
    types,
    currentType,
    setCurrentType,
  } = useData(services, setServices);

  const {deleteService} = useDeleteService(selectedData);

  useEffect(() => {
    fetch();

    const handler = () => fetch();
    on('refreshServices', handler);

    return () => off('refreshServices', handler);
  }, []);

  const projectStore = useContext(ProjectContext);

  useEffect(() => projectStore.updateProjects(projectNames), [projectNames, projectStore]);

  return (
    <Box sx={{mt: 2}}>
      <Paper>
        <Toolbar
          numSelected={selectedData.length}
          onDelete={() => deleteService().then(fetch)}
        ></Toolbar>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selectedData.length > 0 && selectedData.length < data.length}
                    checked={data.length > 0 && selectedData.length === data.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                  ></Checkbox>
                </TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <InputLabel>项目</InputLabel>
                    <Select
                      value={currentProject}
                      label="项目"
                      onChange={(event) => setCurrentProject(event.target.value)}
                    >
                      <MenuItem value="all">全部</MenuItem>
                      {projectNames.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell sx={{width: 100}}>
                  <FormControl sx={{width: 100}}>
                    <InputLabel>类型</InputLabel>
                    <Select
                      value={currentType}
                      label="类型"
                      sx={{minWidth: 10}}
                      onChange={(event) => setCurrentType(event.target.value)}
                    >
                      <MenuItem value="all">全部</MenuItem>
                      {types.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>标识</TableCell>
                <TableCell>地址(api only)</TableCell>
                <TableCell sx={{minWidth: 50}}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.project + item.label}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={item.selected}
                      onChange={() => toggleSelection(item)}
                    ></Checkbox>
                  </TableCell>
                  <TableCell>{item.project}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{item.type === 'api' ? item.url : ''}</TableCell>
                  <TableCell>
                    {item.type === 'app' ? (
                      <Clone
                        projectNames={projectNames}
                        currentProject={item.project}
                        currentLabel={item.label}
                      ></Clone>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
