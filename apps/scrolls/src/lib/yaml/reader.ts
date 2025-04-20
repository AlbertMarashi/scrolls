import { parse, stringify } from 'yaml';

// Define the scroll section structure
export interface ScrollSection {
  canonical: string;
  flamewalker: string;
}

// Define the scroll structure
export interface Scroll {
  title: string;
  summary: string;
  sections: ScrollSection[];
  id?: string; // Optional ID field that will be set when loaded
}

/**
 * Parses a YAML string into a Scroll object
 */
export function parseScrollYaml(yamlContent: string): Scroll {
  return parse(yamlContent) as Scroll;
}

/**
 * Converts a Scroll object to YAML string
 */
export function scrollToYaml(scroll: Scroll): string {
  return stringify(scroll);
}

// Define the module type for the glob import result
interface YamlModule {
  default: string;
}

// Load all scroll YAML files using glob
const files = import.meta.glob<YamlModule>('../scrolls/**.yaml', {
  eager: true,
  query: '?raw',
});

// Process all scrolls and export them as a record
export const scrolls = new Map(
  Object.entries(files).map(([path, module]) => {
    // Extract the scroll ID from the path (filename without extension)
    const [id] = path.split('/').pop()?.split('.') || ['unknown'];
    
    // Access the default property of the module which contains the YAML content
    const content = (module as YamlModule).default;
    
    // Parse the YAML content
    const scroll = parseScrollYaml(content);
    
    // Add the ID to the scroll object for reference
    scroll.id = id;
    
    return [id, scroll];
  })
);
