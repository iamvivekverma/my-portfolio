import useMediaQuery from '../../../hooks/useMediaQuery';
import ApproachFit from './ApproachFit';
import ApproachScroll from './ApproachScroll';

// Big enough to show the whole page without scrolling (like the other pages): one-screen layout.
// Anything smaller gets the long scrolling layout, so nothing is ever cut off.
const FITS = '(min-width: 78rem) and (min-height: 47rem)';

export default function ApproachSection() {
  return useMediaQuery(FITS) ? <ApproachFit /> : <ApproachScroll />;
}
