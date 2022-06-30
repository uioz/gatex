import {ChangeEvent, useEffect, useRef} from 'react';
import Button from './index.module.css';

interface Props {
  file: File | null;
  onChange: (file: File) => void;
}

export default function UploadButton(props: Props) {
  const ref = useRef<HTMLInputElement>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.[0]) {
      props.onChange(event.target.files?.[0]);
    }
  }

  useEffect(() => {
    if (props.file === null) {
      if (ref.current?.value) {
        ref.current.value = '';
      }
    }
  }, [props.file]);

  return (
    <input
      className={Button.Button}
      ref={ref}
      type="file"
      accept="application/zip"
      onChange={handleChange}
    ></input>
  );
}
