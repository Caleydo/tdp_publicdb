/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

import { PluginRegistry } from 'visyn_core/plugin';
import reg from './phovea';

/**
 * build a registry by registering all phovea modules
 */
/// #if include('ordino')
import 'tdp_core/dist/phovea_registry';

try {
  // As ordino is an optional dependency, we can't import it directly: https://github.com/webpack/webpack/issues/15957
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  require('ordino/dist/phovea_registry');
} catch (e) {
  console.error("Failed to load 'ordino/phovea_registry'", e);
}

/// #endif
// self
PluginRegistry.getInstance().register('tdp_publicdb', reg);
