/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
import { PluginRegistry } from 'tdp_core';
import reg from './phovea';
/**
 * build a registry by registering all phovea modules
 */
/// #if include('ordino')
import 'ordino/dist/phovea_registry';
/// #endif
// self
PluginRegistry.getInstance().register('tdp_publicdb', reg);
//# sourceMappingURL=phovea_registry.js.map