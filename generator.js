function generate(){
	const singular = document.getElementById('singular').value
	const plural = document.getElementById('plural').value
	const description = document.getElementById('desc').value
	const taxos = document.getElementById('taxonomies').value
	const language = document.getElementById('language')
	const result = document.getElementById('result')

	result.innerText = `<?php`
	result.innerText += create_cpt(singular, plural, description, taxos)
	result.innerText += create_metabox(singular, plural)
}

function create_cpt(singular, plural, description, taxonomies){
	return `function create_fj_${plural}() {
    $labels = array(
        'name' => _x( '${plural}', 'Post Type General Name', 'textdomain' ),
        'singular_name' => _x( '${singular}', 'Post Type Singular Name', 'textdomain' ),
        'menu_name' => _x( '${plural}', 'Admin Menu text', 'textdomain' ),
        'name_admin_bar' => _x( '${singular}', 'Add New on Toolbar', 'textdomain' ),
        'archives' => __( 'Archives ${singular}', 'textdomain' ),
        'attributes' => __( 'Attributs ${singular}', 'textdomain' ),
        'parent_item_colon' => __( 'Parents ${singular}:', 'textdomain' ),
        'all_items' => __( 'Tous ${plural}', 'textdomain' ),
        'add_new_item' => __( 'Ajouter nouvel ${singular}', 'textdomain' ),
        'add_new' => __( 'Ajouter', 'textdomain' ),
        'new_item' => __( 'Nouvel ${singular}', 'textdomain' ),
        'edit_item' => __( 'Modifier ${singular}', 'textdomain' ),
        'update_item' => __( 'Mettre à jour ${singular}', 'textdomain' ),
        'view_item' => __( 'Voir ${singular}', 'textdomain' ),
        'view_items' => __( 'Voir ${plural}', 'textdomain' ),
        'search_items' => __( 'Rechercher dans les ${singular}', 'textdomain' ),
        'not_found' => __( 'Aucun ${singular} trouvé.', 'textdomain' ),
        'not_found_in_trash' => __( 'Aucun ${singular} trouvé dans la corbeille.', 'textdomain' ),
        'featured_image' => __( 'Image mise en avant', 'textdomain' ),
        'set_featured_image' => __( 'Définir l’image mise en avant', 'textdomain' ),
        'remove_featured_image' => __( 'Supprimer l’image mise en avant', 'textdomain' ),
        'use_featured_image' => __( 'Utiliser comme image mise en avant', 'textdomain' ),
        'insert_into_item' => __( 'Insérer dans ${singular}', 'textdomain' ),
        'uploaded_to_this_item' => __( 'Téléversé sur cet ${singular}', 'textdomain' ),
        'items_list' => __( 'Liste ${plural}', 'textdomain' ),
        'items_list_navigation' => __( 'Navigation de la liste ${plural}', 'textdomain' ),
        'filter_items_list' => __( 'Filtrer la liste ${plural}', 'textdomain' ),
    );
    $args = array(
        'label' => __( '${singular}', 'textdomain' ),
        'description' => __( '${description}' ),
        'labels' => $labels,
        'menu_icon' => 'dashicons-admin-customizer',
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'taxonomies' => array(${taxonomies}),
        'public' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_position' => 5,
        'show_in_admin_bar' => true,
        'show_in_nav_menus' => true,
        'can_export' => true,
        'has_archive' => true,
        'hierarchical' => false,
        'exclude_from_search' => false,
        'show_in_rest' => true,
        'publicly_queryable' => true,
        'capability_type' => 'post',
    );
    register_post_type( '${singular}', $args );
}
add_action( 'init', 'create_fj_${plural}', 0 );`
}

function create_field(label, id, type){
	return `array(
            'label' => '${label}',
            'id' => '${id}',
            'type' => '${type}',
        ),`
}

function create_metabox(singular, plural){
	let response =  `class ${plural}Metabox {
    private $screen = array(
        '${singular}'
    );
    private $meta_fields = array(`

	response += 'd'

	response += `
);
	public function __construct() {
		add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ) );
		add_action( 'save_post', array( $this, 'save_fields' ) );
	}
	public function add_meta_boxes() {
		foreach ( $this->screen as $single_screen ) {
			add_meta_box(
				'${plural}',
				__( '${plural}', 'textdomain' ),
				array( $this, 'meta_box_callback' ),
				$single_screen,
				'advanced',
				'default'
			);
		}
	}
	public function meta_box_callback( $post ) {
		wp_nonce_field( '${plural}_data', '${plural}_nonce' );
		echo 'Options pour ${plural}';
		$this->field_generator( $post );
	}
	public function field_generator( $post ) {
		$output = '';
		foreach ( $this->meta_fields as $meta_field ) {
			$label = '<label for="' . $meta_field['id'] . '">' . $meta_field['label'] . '</label>';
			$meta_value = get_post_meta( $post->ID, $meta_field['id'], true );
			if ( empty( $meta_value ) ) {
				if ( isset( $meta_field['default'] ) ) {
					$meta_value = $meta_field['default'];
				}
			}
			switch ( $meta_field['type'] ) {
				default:
					$input = sprintf(
						'<input %s id="%s" name="%s" type="%s" value="%s">',
						$meta_field['type'] !== 'color' ? 'style="width: 100%"' : '',
						$meta_field['id'],
						$meta_field['id'],
						$meta_field['type'],
						$meta_value
					);
			}
			$output .= $this->format_rows( $label, $input );
		}
		echo '<table class="form-table"><tbody>' . $output . '</tbody></table>';
	}
	public function format_rows( $label, $input ) {
		return '<tr><th>'.$label.'</th><td>'.$input.'</td></tr>';
	}
	public function save_fields( $post_id ) {
		if ( ! isset( $_POST['${plural}_nonce'] ) )
			return $post_id;
		$nonce = $_POST['${plural}_nonce'];
		if ( !wp_verify_nonce( $nonce, '${plural}_data' ) )
			return $post_id;
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
			return $post_id;
		foreach ( $this->meta_fields as $meta_field ) {
			if ( isset( $_POST[ $meta_field['id'] ] ) ) {
				switch ( $meta_field['type'] ) {
					case 'email':
						$_POST[ $meta_field['id'] ] = sanitize_email( $_POST[ $meta_field['id'] ] );
						break;
					case 'text':
						$_POST[ $meta_field['id'] ] = sanitize_text_field( $_POST[ $meta_field['id'] ] );
						break;
				}
				update_post_meta( $post_id, $meta_field['id'], $_POST[ $meta_field['id'] ] );
			} else if ( $meta_field['type'] === 'checkbox' ) {
				update_post_meta( $post_id, $meta_field['id'], '0' );
			}
		}
	}
}
if (class_exists('${plural}Metabox')) {
	new ${plural}Metabox;
};`

	return response
}