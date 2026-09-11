function h(type, props, ...children) {
  return {
    type,
    props: props ?? {},
    children: children.flat().filter((c) => c != null && c !== false),
  };
}

export default h;
