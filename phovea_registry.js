/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

import {register} from 'phovea_core/src/plugin';
import reg from './dist/phovea';

/**
 * build a registry by registering all phovea modules
 */
//other modules
import 'tdp_gene/phovea_registry.js';
/// #if include('ordino')
import 'ordino/phovea_registry.js';
/// #endif
/// #if include('dTiles')
import 'dTiles/phovea_registry.js';
/// #endif
//self
register('tdp_publicdb',reg);
