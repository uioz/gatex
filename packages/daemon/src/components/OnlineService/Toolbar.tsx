import {Toolbar, Typography, IconButton, alpha} from '@mui/material';
import {Delete} from '@mui/icons-material';

export default function EnhanceToolbar({
  numSelected,
  onDelete,
}: {
  numSelected: number;
  onDelete?: () => void;
}) {
  return (
    <Toolbar
      sx={{
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{flex: '1 1 100%'}} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography variant="h5">在线服务</Typography>
      )}
      {numSelected > 0 ? (
        <IconButton onClick={onDelete}>
          <Delete></Delete>
        </IconButton>
      ) : null}
    </Toolbar>
  );
}
