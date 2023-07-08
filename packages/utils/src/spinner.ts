import { Spinner } from 'cli-spinner';

export default function SpinnerInstance(msg: string, spinnerString: string = '|/-\\'): Spinner {
  const spinner: Spinner = new Spinner(`${msg}... %s`);
  spinner.setSpinnerString(spinnerString);
  return spinner;
}
