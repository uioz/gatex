import React, {useRef, useState} from 'react';
import {
  IconButton,
  Popover,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {LoadingButton} from '@mui/lab';
import {CopyAll} from '@mui/icons-material';

interface Options {
  /**
   * 项目名称
   */
  projectNames: Array<string>;
  /**
   * 当前所选的标识
   */
  currentLabel?: string;
  /**
   * 默认激活的项目名称
   */
  currentProject?: string;
}

export default function Clone({projectNames, currentLabel, currentProject}: Options) {
  const anchorEl = useRef(null);
  const [open, setOpen] = useState(false);
  const [checkedProject, setCheckedProject] = useState(currentProject ?? '');
  const [label, setLabel] = useState(currentLabel ? `${currentLabel.split('@')[0]}@` : '');
  const [uploading, setUploading] = useState(false);

  async function upload() {
    setUploading(true);

    try {
      await fetch(
        `/api/service/app/clone/${currentProject}@${currentLabel}/${checkedProject}@${label}`,
        {
          method: 'POST',
        }
      );
      setOpen(false);
    } catch (error) {
      alert('提交失败');
      throw error;
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <IconButton title="克隆" ref={anchorEl} onClick={() => setOpen(true)}>
        <CopyAll></CopyAll>
      </IconButton>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={anchorEl.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Paper sx={{p: 2, width: 400}}>
          <Typography>选择克隆目标</Typography>
          <FormControl fullWidth sx={{mt: 2}}>
            <InputLabel>项目</InputLabel>
            <Select
              value={checkedProject}
              label="项目"
              size="small"
              onChange={(event) => setCheckedProject(event.target.value)}
            >
              {projectNames.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            sx={{mt: 2}}
            size="small"
            fullWidth
            label="标识"
            placeholder="api@channel 或者只配置api名称"
            variant="outlined"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
          <LoadingButton
            sx={{mt: 2}}
            loading={uploading}
            variant="outlined"
            size="small"
            color="secondary"
            onClick={upload}
          >
            提交
          </LoadingButton>
        </Paper>
      </Popover>
    </>
  );
}
