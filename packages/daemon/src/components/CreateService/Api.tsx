import {useState} from 'react';
import {TextField, Autocomplete} from '@mui/material';
import {LoadingButton} from '@mui/lab';
import {useProjectStore} from '../../store/project';
import {emit} from '../../utils/eventBus';

export default function Api() {
  const {projects} = useProjectStore();
  const [uploading, setUploading] = useState(false);
  const [project, setProject] = useState('');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  async function submit() {
    setUploading(true);

    try {
      const {status} = await fetch(
        `/api/service/api/${project}/${label}` + (url ? `?url=${url}` : ''),
        {
          method: 'POST',
        }
      );

      if (status !== 200) {
        throw new Error();
      }

      setProject('');
      setLabel('');
      setUrl('');

      emit('refreshServices');
    } catch (error) {
      alert('提交失败');
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Autocomplete
        freeSolo
        options={projects}
        fullWidth
        onChange={(_, value) => setProject(value ?? '')}
        value={project}
        renderInput={(params) => (
          <TextField
            {...params}
            onChange={(e) => setProject(e.target.value)}
            variant="filled"
            label="项目"
          />
        )}
      ></Autocomplete>
      <TextField
        fullWidth
        sx={{mt: 2}}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        label="标识"
        variant="filled"
        placeholder="APP名称 例子 dev | master"
      />
      <TextField
        fullWidth
        sx={{mt: 2}}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        label="服务地址(url)"
        variant="filled"
        placeholder="https://example.com"
      />
      <LoadingButton
        sx={{mt: 2}}
        loading={uploading}
        onClick={submit}
        variant="outlined"
        color="secondary"
      >
        提交
      </LoadingButton>
    </>
  );
}
