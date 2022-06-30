import {useState} from 'react';
import {TextField, Autocomplete} from '@mui/material';
import {LoadingButton} from '@mui/lab';
import {useProjectStore} from '../../store/project';
import {emit} from '../../utils/eventBus';
import UploadButton from '../UploadButton';

export default function App() {
  const {projects} = useProjectStore();
  const [uploading, setUploading] = useState(false);
  const [project, setProject] = useState('');
  const [label, setLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);

  async function submit() {
    setUploading(true);

    try {
      const {status} = await fetch(`/api/service/app/${project}/${label}`, {
        method: 'POST',
        body: file,
      });

      if (status !== 200) {
        throw new Error();
      }

      setProject('');
      setLabel('');
      setFile(null);

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
        placeholder="API名称[@channel] 例子 dev@official | dev"
      />
      <UploadButton file={file} onChange={setFile}></UploadButton>
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
