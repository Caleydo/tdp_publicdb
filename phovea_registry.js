/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

import {PluginRegistry} from 'tdp_core';
import reg from './src/phovea';

/**
 * build a registry by registering all phovea modules
 */
//other modules
import 'tdp_gene/phovea_registry.js';
/// #if include('ordino')
import 'ordino/phovea_registry.js';
/// #endif
//self
PluginRegistry.getInstance().register('tdp_publicdb',reg);
