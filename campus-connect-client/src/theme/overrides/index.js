import Fab from './Fab';
import Chip from './Chip';
import Tabs from './Tabs';
import Link from './Link';
import Badge from './Badge';
import Avatar from './Avatar';
import Button from './Button';
import Backdrop from './Backdrop';
import Typography from './Typography';
import Breadcrumbs from './Breadcrumbs';
import CssBaseline from './CssBaseline';

// ----------------------------------------------------------------------

export default function ComponentsOverrides(theme) {
  return Object.assign(
    Fab(theme),
    Tabs(theme),
    Chip(theme),
    Link(theme),
    Badge(theme),
    Button(theme),
    Avatar(theme),
    Backdrop(theme),
    Typography(theme),
    Breadcrumbs(theme),
      CssBaseline(theme)
  );
}
